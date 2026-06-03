import { AdminAuthService } from '../../infrastructure/auth/AdminAuthService';

export async function verifyAdmin(
  name: string,
  authService: AdminAuthService
): Promise<boolean> {
  const trimmed = name.trim();
  // Validación de dominio: nombre mínimo 8 chars, al menos 1 número (ARC-12)
  if (trimmed.length < 8 || !/\d/.test(trimmed)) {
    return false;
  }
  return authService.verify(trimmed);
}
