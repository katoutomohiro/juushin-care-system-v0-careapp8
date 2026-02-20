import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * GET /api/security/domain-model
 * 
 * Returns the DOMAIN_MODEL.md documentation for security audits.
 * Read-only endpoint (no database access).
 */
export async function GET(req: NextRequest) {
  try {
    const docsPath = join(process.cwd(), 'docs', 'DOMAIN_MODEL.md');
    const content = await readFile(docsPath, 'utf-8');
    
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=300', // 5 min cache
      },
    });
  } catch (error) {
    console.error('Failed to read DOMAIN_MODEL.md:', error);
    return NextResponse.json(
      { ok: false, error: 'domain_model_unavailable' },
      { status: 500 }
    );
  }
}
