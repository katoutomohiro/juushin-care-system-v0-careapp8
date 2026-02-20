import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

interface AuditedTable {
  name: string;
  documented: boolean;
  rls_policy_expected: boolean;
}

/**
 * GET /api/security/rls-audit
 * 
 * Returns RLS coverage audit based on DOMAIN_MODEL.md documentation.
 * Read-only endpoint (no database access).
 * Extracts table names from markdown headers and checks RLS status in table descriptions.
 */
export async function GET(req: NextRequest) {
  try {
    const docsPath = join(process.cwd(), 'docs', 'DOMAIN_MODEL.md');
    const content = await readFile(docsPath, 'utf-8');
    
    // Extract table names from markdown headers (### tablename)
    const tableHeaderRegex = /^### (.+)$/gm;
    const matches = content.matchAll(tableHeaderRegex);
    const auditedTables: AuditedTable[] = [];
    
    for (const match of matches) {
      const tableName = match[1].trim();
      
      // Find the table section to check RLS status
      const tableStartIndex = match.index || 0;
      const nextTableIndex = content.indexOf('\n### ', tableStartIndex + 4);
      const tableSection = nextTableIndex > 0 
        ? content.substring(tableStartIndex, nextTableIndex)
        : content.substring(tableStartIndex);
      
      // Check if RLS is mentioned as enabled in the table section
      const hasRLSEnabled = /\*\*RLS\*\*:\s*Enabled/i.test(tableSection);
      
      auditedTables.push({
        name: tableName,
        documented: true,
        rls_policy_expected: hasRLSEnabled,
      });
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
