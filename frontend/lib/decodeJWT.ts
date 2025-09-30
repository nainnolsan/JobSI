// Simple función para decodificar JWT (sin validación de firma, solo para frontend)
export interface JWTPayload {
  userId?: number;
  username?: string;
  nombres?: string;
  iat?: number;
  [key: string]: unknown;
}

export function decodeJWT(token: string): JWTPayload | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch (e) {
    return null;
  }
}
