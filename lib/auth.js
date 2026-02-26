import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'fallback-secret';

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

export function getUserFromRequest(request) {
  const token = request.cookies.get('fincast_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}
