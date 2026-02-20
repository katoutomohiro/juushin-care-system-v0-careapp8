import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * GET /api/security/rls-violations
 * 
 * Reads docs/DOMAIN_MODEL.md from filesystem and analyzes RLS configuration.
 * Returns tables that require RLS protection and any violations (tables missing RLS).
 * Read-only endpoint (no database access, no network calls).
 * 
 * Fixes CodeQL SSRF warning by removing req.nextUrl.origin and fetch() calls.
 * Parses documentation directly instead of calling internal APIs.
 */
export async function GET(_req: NextRequest) {
  try {
    // Read DOMAIN_MODEL.md from filesystem
    const docsPath = join(process.cwd(), 'docs', 'DOMAIN_MODEL.md');
    const content = await readFile(docsPath, 'utf-8');

    // Parse table names from markdown headings: ### <table_name>
    const tableMatches = content.matchAll(/^### ([a-z_]+)$/gm);
    const allTables = Array.from(tableMatches, m => m[1]);

    // Filter out audit_events; remaining are required tables
    const requiredTables = allTables.filter(table => table !== 'audit_events');

    // For each required table, check if RLS is enabled by finding "**RLS**: Enabled"
    const rlsEnabledTables: string[] = [];

    for (const table of requiredTables) {
      // Find the section for this table: from "### tablename" until next "###" or EOF
      const tableSectionRegex = new RegExp(
        `^### ${table}$[\\s\\S]*?(?=^###|\\Z)`,
        'm'
      );
      const match = content.match(tableSectionRegex);

      if (match && /\*\*RLS\*\*:\s*Enabled/i.test(match[0])) {
        rlsEnabledTables.push(table);
      }
    }

    // Calculate violations: tables in required but not in rls_enabled
    const enabledSet = new Set(rlsEnabledTables);
    const violations = requiredTables.filter(table => !enabledSet.has(table));

    return NextResponse.json({
      required_tables: requiredTables,
      rls_enabled_tables: rlsEnabledTables,
      violations: violations,
      source: 'docs/DOMAIN_MODEL.md',
      mode: 'documentation-only',
    });
  } catch (error) {
    console.error('RLS violation check failed:', error);
    return NextResponse.json(
      { ok: false, error: 'rls_violation_check_failed' },
      { status: 500 }
    );
  }
}
