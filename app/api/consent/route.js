import { NextResponse } from 'next/server';
import pg from 'pg';
import { carriers } from '../../../lib/carriers';

const pool = globalThis.__rhc || new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
globalThis.__rhc = pool;
const allowedCarriers = new Set(carriers.map(carrier => carrier.n));

export async function POST(request) {
  try {
    const body = await request.json();
    if (!allowedCarriers.has(body?.carrier) || !/^[0-9a-f-]{36}$/i.test(body?.huntId || '')) {
      return NextResponse.json({ error: 'Invalid handoff request' }, { status: 400 });
    }
    const exists = await pool.query('SELECT 1 FROM rate_hunts WHERE id = $1 LIMIT 1', [body.huntId]);
    if (!exists.rowCount) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    await pool.query(
      'INSERT INTO consent_events(consent_type,carrier_id,payload) VALUES($1,$2,$3)',
      ['carrier_handoff', body.carrier, JSON.stringify({ source: 'ratehunt', huntId: body.huntId, mode: 'external', transferred: false, occurredAt: new Date().toISOString() })]
    );
    return NextResponse.json({ ok: true }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Unable to record handoff' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
