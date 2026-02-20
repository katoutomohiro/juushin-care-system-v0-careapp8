import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * GET /api/security/rls-required
 * 
 * Returns list of tables that MUST have RLS enabled based on DOMAIN_MODEL.md.
 * Read-only endpoint (no database access).
 */
export async function GET(req: NextRequest) {
  try {
    const docsPath = join(process.cwd(), 'docs', 'DOMAIN_MODEL.md');
    const content = await readFile(docsPath, 'utf-8');
    
    // Extract table names from markdown headers (### tablename)
    const tableHeaderRegex = /^### (.+)$/gm;
    const matches = content.matchAll(tableHeaderRegex);
    const requiredRLSTables: string[] = [];
    
    for (const match of matches) {
      const tableName = match[1].trim();
      // Ignore audit_events table
      if (tableName.toLowerCase() === 'audit_events') {
        continue;
      }
      requiredRLSTables.push(tableName);
    }
    
    return NextResponse.json({
      required_rls_tables: requiredRLSTables,
      source: 'docs/DOMAIN_MODEL.md',
      mode: 'documentation-only',
    });
  } catch (error) {
    console.error('Failed to read required RLS tables from DOMAIN_MODEL.md:', error);
    return NextResponse.json(
      { ok: false, error: 'rls_required_unavailable' },
      { status: 500 }
    );
  }
}
