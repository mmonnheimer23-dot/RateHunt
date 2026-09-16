import { NextResponse } from 'next/server';
import crypto from 'crypto';
import pg from 'pg';
import { encryptJson, requesterHash } from '../../../lib/security';
import { safeEstimates, validateSubmission } from '../../../lib/validation';

const pool = globalThis.__rh || new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
globalThis.__rh = pool;

const json = (body, status) => NextResponse.json(body, {
  status,
  headers: { 'Cache-Control': 'no-store, max-age=0' }
});

export async function POST(request) {
  try {
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 65536) return json({ error: 'The submission is too large.' }, 413);
    const body = await request.json();
    const validated = validateSubmission(body);
    if (!validated.ok) return json({ error: 'Please review the highlighted information.', details: validated.errors }, 400);

    const ipHash = requesterHash(request);
    const recent = await pool.query(
      "SELECT COUNT(*)::int AS count FROM rate_hunts WHERE created_at > NOW() - INTERVAL '1 hour' AND summary_payload->>'requesterHash' = $1",
      [ipHash]
    );
    if ((recent.rows[0]?.count || 0) >= 8) return json({ error: 'Too many recent requests. Please try again later.' }, 429);

    const id = crypto.randomUUID();
    const acceptedAt = new Date().toISOString();
    const encryptedIntake = encryptJson(validated.intake);
    const summary = {
      source: 'modeled_estimate',
      modelVersion: String(body.modelVersion || 'unknown').slice(0, 40),
      estimates: safeEstimates(body.estimates),
      requesterHash: ipHash
    };
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const saved = await client.query(
        'INSERT INTO rate_hunts(id,search_type,state_code,coverage_profile,status,intake_payload,summary_payload) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id,search_type,state_code,coverage_profile,status,created_at',
        [id, validated.searchType, validated.stateCode, validated.coverageProfile, 'estimates_ready', JSON.stringify(encryptedIntake), JSON.stringify(summary)]
      );
      await client.query(
        'INSERT INTO consent_events(consent_type,carrier_id,payload) VALUES($1,$2,$3)',
        ['quote_request', null, JSON.stringify({ huntId: id, version: body.consent.version, acceptedAt, requesterHash: ipHash })]
      );
      await client.query('COMMIT');
      return json({ hunt: saved.rows[0] }, 201);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('RateHunt submission failed', error?.message || error);
    return json({ error: 'We could not securely save this RateHunt. Please call the agency at 505-207-2747.' }, 500);
  }
}

export async function GET() {
  return json({ error: 'Customer submission history requires an authenticated account.' }, 401);
}
