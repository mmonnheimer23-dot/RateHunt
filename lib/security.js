import crypto from 'crypto';

function encryptionKey() {
  const value = process.env.RATEHUNT_DATA_ENCRYPTION_KEY || '';
  let key = /^[a-f0-9]{64}$/i.test(value)
    ? Buffer.from(value, 'hex')
    : Buffer.from(value, 'base64');
  if (key.length !== 32 && process.env.DATABASE_URL) {
    key = crypto.createHash('sha256').update(`ratehunt-intake-v1:${process.env.DATABASE_URL}`).digest();
  }
  if (key.length !== 32) {
    throw new Error('RATEHUNT_DATA_ENCRYPTION_KEY must be a 32-byte base64 or 64-character hex key');
  }
  return key;
}

export function encryptJson(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(value), 'utf8'),
    cipher.final()
  ]);
  return {
    version: 1,
    algorithm: 'AES-256-GCM',
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
    ciphertext: ciphertext.toString('base64')
  };
}

export function requesterHash(request) {
  const forwarded = request.headers.get('x-vercel-forwarded-for')
    || request.headers.get('x-forwarded-for')
    || request.headers.get('x-real-ip')
    || 'unknown';
  const ip = forwarded.split(',')[0].trim().slice(0, 64);
  const key = process.env.RATEHUNT_DATA_HASH_KEY || process.env.RATEHUNT_DATA_ENCRYPTION_KEY || process.env.DATABASE_URL;
  if (!key) throw new Error('RateHunt hashing secret is not configured');
  return crypto.createHmac('sha256', key).update(ip).digest('hex');
}
