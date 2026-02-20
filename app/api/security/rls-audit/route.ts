import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * GET /api/security/rls-audit
 * 
 * Returns RLS coverage audit based on DOMAIN_MODEL.md documentation.
 * Read-only endpoint (no database access).
 */
export async function GET(req: NextRequest) {
  try {
    const docsPath = join(process.cwd(), 'docs', 'DOMAIN_MODEL.md');
    const content = await readFile(docsPath, 'utf-8');
    
    // Extract table names from markdown headers (### tablename)
    const tableHeaderRegex = /^### (.+)$/gm;
    const matches = content.matchAll(tableHeaderRegex);
    const auditedTables: string[] = [];
    
    for (const match of matches) {
      const tableName = match[1].trim();
      auditedTables.push(tableName);
    }
    
    return NextResponse.json({
      audited_tables: auditedTables,
      source: 'docs/DOMAIN_MODEL.md',
      mode: 'documentation-only',
    });
  } catch (error) {
    console.error('Failed to audit RLS from DOMAIN_MODEL.md:', error);
    return NextResponse.json(
      { ok: false, error: 'rls_audit_unavailable' },
      { status: 500 }
    );
  }
}
