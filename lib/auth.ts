import { SignJWT, jwtVerify } from 'jose';

function encodedKey() {
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) throw new Error('JWT_SECRET is not set');
  return new TextEncoder().encode(secretKey);
}

export async function encrypt(payload: Record<string, unknown>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(encodedKey());
}

export async function decrypt(session: string) {
  try {
    const { payload } = await jwtVerify(session, encodedKey(), {
      algorithms: ['HS256'],
    });
    return payload;
  } catch {
    console.error('Failed to verify session');
    return null;
  }
}
