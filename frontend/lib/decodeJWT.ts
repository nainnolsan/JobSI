// Simple función para decodificar JWT (sin validación de firma, solo para frontend)
export function decodeJWT(token: string): any {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch (e) {
    return null;
  }
}
