# -*- coding: utf-8 -*-
"""
データベースモデル解析ユーティリティ
- Prisma schema.prisma の検出とパース
- TypeORM エンティティファイルの検出とパース
- フィールド/リレーション情報の抽出
"""
from __future__ import annotations

import glob
import re
from pathlib import Path
from typing import List, Dict, Any, Tuple, Optional


def find_prisma_schemas(root: Path = Path(".")) -> List[Path]:
    """プロジェクト内の schema.prisma ファイルを検索"""
    return [Path(p) for p in glob.glob(str(root / "**" / "schema.prisma"), recursive=True)]


def find_typeorm_entities(root: Path = Path(".")) -> List[Path]:
    """TypeORM エンティティファイルを検索 (*.entity.ts パターン)"""
    return [Path(p) for p in glob.glob(str(root / "**" / "*.entity.ts"), recursive=True)]


def parse_prisma_schema(schema_path: Path) -> Dict[str, Any]:
    """
    Prisma schema.prisma を簡易パースして構造情報を抽出
    
    Returns:
        {
            "models": [
                {"name": "User", "fields": [{"name": "id", "type": "Int", "attributes": "@id @default(autoincrement())"}], "relations": []},
                ...
            ],
            "datasource": {"provider": "postgresql", "url": "env(...)"},
            "generator": {"provider": "prisma-client-js"}
        }
    """
    if not schema_path.exists():
        return {"models": [], "datasource": None, "generator": None}
    
    content = schema_path.read_text(encoding="utf-8")
    
    result: Dict[str, Any] = {
        "models": [],
        "datasource": None,
        "generator": None,
    }
    
    # datasource ブロック検出
    datasource_match = re.search(r'datasource\s+\w+\s*\{([^}]+)\}', content, re.DOTALL)
    if datasource_match:
        ds_block = datasource_match.group(1)
        provider_match = re.search(r'provider\s*=\s*"([^"]+)"', ds_block)
        url_match = re.search(r'url\s*=\s*(.+)', ds_block)
        result["datasource"] = {
            "provider": provider_match.group(1) if provider_match else "unknown",
            "url": url_match.group(1).strip() if url_match else "unknown",
        }
    
    # generator ブロック検出
    generator_match = re.search(r'generator\s+\w+\s*\{([^}]+)\}', content, re.DOTALL)
    if generator_match:
        gen_block = generator_match.group(1)
        provider_match = re.search(r'provider\s*=\s*"([^"]+)"', gen_block)
        result["generator"] = {
            "provider": provider_match.group(1) if provider_match else "unknown",
        }
    
    # model ブロック検出
    model_blocks = re.finditer(r'model\s+(\w+)\s*\{([^}]+)\}', content, re.DOTALL)
    for model_match in model_blocks:
        model_name = model_match.group(1)
        model_body = model_match.group(2)
        
        fields = []
        relations = []
        
        # フィールド行をパース（例: id Int @id @default(autoincrement())）
        field_lines = [line.strip() for line in model_body.split('\n') if line.strip() and not line.strip().startswith('//')]
        for field_line in field_lines:
            # リレーションフィールドは別扱い (型名が大文字で始まる)
            field_match = re.match(r'(\w+)\s+(\w+)(\[\])?\s*(.*)', field_line)
            if field_match:
                field_name = field_match.group(1)
                field_type = field_match.group(2)
                is_array = field_match.group(3) == '[]'
                attributes = field_match.group(4).strip()
                
                # リレーション判定: 型が大文字で始まる（モデル名）
                if field_type[0].isupper():
                    relations.append({
                        "name": field_name,
                        "type": field_type,
                        "is_array": is_array,
                        "attributes": attributes,
                    })
                else:
                    fields.append({
                        "name": field_name,
                        "type": field_type,
                        "is_optional": '?' in field_line,
                        "attributes": attributes,
                    })
        
        result["models"].append({
            "name": model_name,
            "fields": fields,
            "relations": relations,
        })
    
    return result


def parse_typeorm_entity(entity_path: Path) -> Dict[str, Any]:
    """
    TypeORM エンティティファイルを簡易パースして構造情報を抽出
    
    Returns:
        {
            "name": "User",
            "table": "users",
            "columns": [{"name": "id", "type": "int", "decorators": ["@PrimaryGeneratedColumn()"]}, ...],
            "relations": [{"name": "posts", "type": "Post", "decorator": "@OneToMany(...)"}, ...]
        }
    """
    if not entity_path.exists():
        return {"name": "", "table": "", "columns": [], "relations": []}
    
    content = entity_path.read_text(encoding="utf-8")
    
    result: Dict[str, Any] = {
        "name": "",
        "table": "",
        "columns": [],
        "relations": [],
    }
    
    # @Entity デコレータから table 名取得
    entity_match = re.search(r'@Entity\(\s*[\'"]([^\'"]+)[\'"]\s*\)', content)
    if entity_match:
        result["table"] = entity_match.group(1)
    
    # class 名取得
    class_match = re.search(r'export\s+class\s+(\w+)', content)
    if class_match:
        result["name"] = class_match.group(1)
    
    # @Column, @PrimaryGeneratedColumn などのフィールド検出
    column_pattern = r'@(Column|PrimaryGeneratedColumn|CreateDateColumn|UpdateDateColumn)\([^)]*\)\s+(\w+)[!?]?:\s*(\w+)'
    for col_match in re.finditer(column_pattern, content):
        decorator = col_match.group(1)
        field_name = col_match.group(2)
        field_type = col_match.group(3)
        result["columns"].append({
            "name": field_name,
            "type": field_type,
            "decorator": f"@{decorator}",
        })
    
    # @OneToMany, @ManyToOne などのリレーション検出
    relation_pattern = r'@(OneToMany|ManyToOne|OneToOne|ManyToMany)\([^)]*\)\s+(\w+)[!?]?:\s*(\w+)'
    for rel_match in re.finditer(relation_pattern, content):
        decorator = rel_match.group(1)
        field_name = rel_match.group(2)
        field_type = rel_match.group(3)
        result["relations"].append({
            "name": field_name,
            "type": field_type,
            "decorator": f"@{decorator}",
        })
    
    return result


def detect_database_infrastructure() -> Dict[str, Any]:
    """
    プロジェクト全体でデータベースインフラを検出
    
    Returns:
        {
            "has_prisma": bool,
            "has_typeorm": bool,
            "prisma_schemas": [Path, ...],
            "typeorm_entities": [Path, ...],
            "parsed_prisma": [dict, ...],
            "parsed_typeorm": [dict, ...],
        }
    """
    prisma_schemas = find_prisma_schemas()
    typeorm_entities = find_typeorm_entities()
    
    parsed_prisma = []
    for schema in prisma_schemas:
        parsed = parse_prisma_schema(schema)
        parsed_prisma.append({"path": str(schema), "data": parsed})
    
    parsed_typeorm = []
    for entity in typeorm_entities:
        parsed = parse_typeorm_entity(entity)
        parsed_typeorm.append({"path": str(entity), "data": parsed})
    
    return {
        "has_prisma": len(prisma_schemas) > 0,
        "has_typeorm": len(typeorm_entities) > 0,
        "prisma_schemas": [str(p) for p in prisma_schemas],
        "typeorm_entities": [str(p) for p in typeorm_entities],
        "parsed_prisma": parsed_prisma,
        "parsed_typeorm": parsed_typeorm,
    }


def generate_db_analysis_report(detection_result: Dict[str, Any]) -> str:
    """
    検出結果から Markdown レポートを生成
    """
    lines = [
        "# Database Model Analysis Report",
        "",
        "## Infrastructure Detection",
        "",
    ]
    
    if not detection_result["has_prisma"] and not detection_result["has_typeorm"]:
        lines.extend([
            "**Status:** No database schema infrastructure detected",
            "",
            "### Recommendations:",
            "- Consider setting up Prisma or TypeORM for type-safe database access",
            "- Create a `prisma/schema.prisma` file if using Prisma",
            "- Create `*.entity.ts` files in a dedicated directory if using TypeORM",
        ])
        return "\n".join(lines)
    
    if detection_result["has_prisma"]:
        lines.extend([
            "✅ **Prisma detected**",
            "",
            f"- Found {len(detection_result['prisma_schemas'])} schema file(s):",
        ])
        for schema_path in detection_result["prisma_schemas"]:
            lines.append(f"  - `{schema_path}`")
        lines.append("")
        
        # 各スキーマの詳細
        for schema_info in detection_result["parsed_prisma"]:
            path = schema_info["path"]
            data = schema_info["data"]
            lines.append(f"### Schema: `{path}`")
            lines.append("")
            
            if data.get("datasource"):
                ds = data["datasource"]
                lines.append(f"**Datasource:** `{ds['provider']}` (url: `{ds['url']}`)")
                lines.append("")
            
            if data.get("models"):
                lines.append(f"**Models:** {len(data['models'])} defined")
                lines.append("")
                for model in data["models"]:
                    lines.append(f"#### Model: `{model['name']}`")
                    lines.append("")
                    if model["fields"]:
                        lines.append("**Fields:**")
                        for field in model["fields"]:
                            opt = " (optional)" if field.get("is_optional") else ""
                            lines.append(f"- `{field['name']}`: `{field['type']}`{opt} {field.get('attributes', '')}")
                        lines.append("")
                    if model["relations"]:
                        lines.append("**Relations:**")
                        for rel in model["relations"]:
                            array_suffix = "[]" if rel.get("is_array") else ""
                            lines.append(f"- `{rel['name']}`: `{rel['type']}{array_suffix}` {rel.get('attributes', '')}")
                        lines.append("")
    
    if detection_result["has_typeorm"]:
        lines.extend([
            "✅ **TypeORM detected**",
            "",
            f"- Found {len(detection_result['typeorm_entities'])} entity file(s):",
        ])
        for entity_path in detection_result["typeorm_entities"]:
            lines.append(f"  - `{entity_path}`")
        lines.append("")
        
        # 各エンティティの詳細
        for entity_info in detection_result["parsed_typeorm"]:
            path = entity_info["path"]
            data = entity_info["data"]
            lines.append(f"### Entity: `{data['name']}` (table: `{data['table']}`)")
            lines.append(f"**File:** `{path}`")
            lines.append("")
            
            if data["columns"]:
                lines.append("**Columns:**")
                for col in data["columns"]:
                    lines.append(f"- `{col['name']}`: `{col['type']}` ({col['decorator']})")
                lines.append("")
            
            if data["relations"]:
                lines.append("**Relations:**")
                for rel in data["relations"]:
                    lines.append(f"- `{rel['name']}`: `{rel['type']}` ({rel['decorator']})")
                lines.append("")
    
    lines.extend([
        "---",
        "",
        "## Suggestions",
        "",
        "- Ensure all models have proper indexes for frequently queried fields",
        "- Consider adding soft delete columns (deletedAt) for audit trails",
        "- Review relation configurations for proper cascade behavior",
        "- Add database migration version control (prisma migrate / typeorm migration)",
    ])
    
    return "\n".join(lines)
