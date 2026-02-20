import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/security/rls-violations
 * 
 * Compares required RLS tables (from DOMAIN_MODEL.md) with audited tables.
 * Returns tables that must have RLS but are missing audit entries.
 * Read-only endpoint (no database access).
 */
export async function GET(req: NextRequest) {
  try {
    // Call internal APIs
    const baseUrl = req.nextUrl.origin || 'http://localhost:3000';
    
    const [requiredRes, auditedRes] = await Promise.all([
      fetch(`${baseUrl}/api/security/rls-required`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/security/rls-audit`, { cache: 'no-store' }),
    ]);

    if (!requiredRes.ok || !auditedRes.ok) {
      console.error('Failed to fetch RLS data:', {
        requiredStatus: requiredRes.status,
        auditedStatus: auditedRes.status,
      });
      return NextResponse.json(
        { ok: false, error: 'rls_violation_check_failed' },
        { status: 500 }
      );
    }

    const requiredData = await requiredRes.json();
    const auditedData = await auditedRes.json();

    const requiredTables: string[] = requiredData.required_rls_tables || [];
    const auditedTables: string[] = (auditedData.audited_tables || []).map(
      (table: any) => typeof table === 'string' ? table : table.name
    );

    // Calculate violations: tables in required but not in audited
    const auditedSet = new Set(auditedTables);
    const violations = requiredTables.filter(table => !auditedSet.has(table));

    return NextResponse.json({
      required: requiredTables,
      audited: auditedTables,
      violations: violations,
    });
  } catch (error) {
    console.error('RLS violation check failed:', error);
    return NextResponse.json(
      { ok: false, error: 'rls_violation_check_failed' },
      { status: 500 }
    );
  }
}
