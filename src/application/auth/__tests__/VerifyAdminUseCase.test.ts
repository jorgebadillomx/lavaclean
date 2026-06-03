import { verifyAdmin } from '../VerifyAdminUseCase';
import { AdminAuthService } from '../../../infrastructure/auth/AdminAuthService';

const makeService = (result: boolean): AdminAuthService => ({
  verify: jest.fn().mockResolvedValue(result),
} as unknown as AdminAuthService);

describe('VerifyAdminUseCase', () => {
  it('retorna false para nombre < 8 chars tras trim', async () => {
    expect(await verifyAdmin('Ad1', makeService(true))).toBe(false);
    expect(await verifyAdmin('  Ad1  ', makeService(true))).toBe(false);
  });

  it('retorna false para nombre sin dígito', async () => {
    expect(await verifyAdmin('AdminTest', makeService(true))).toBe(false);
  });

  it('retorna false para string vacío', async () => {
    expect(await verifyAdmin('', makeService(true))).toBe(false);
  });

  it('delega al servicio cuando nombre cumple las reglas de dominio', async () => {
    const service = makeService(true);
    expect(await verifyAdmin('AdminTest1234', service)).toBe(true);
    expect(service.verify).toHaveBeenCalledWith('AdminTest1234');
  });

  it('trim antes de validar — "  Admin1234  " (11 chars con espacios, 9 sin) pasa la guarda', async () => {
    const service = makeService(true);
    expect(await verifyAdmin('  Admin1234  ', service)).toBe(true);
    expect(service.verify).toHaveBeenCalledWith('Admin1234');
  });

  it('exactamente 8 chars con dígito pasa la guarda', async () => {
    const service = makeService(true);
    expect(await verifyAdmin('Admin123', service)).toBe(true);
  });

  it('exactamente 7 chars con dígito falla la guarda', async () => {
    expect(await verifyAdmin('Admi123', makeService(true))).toBe(false);
  });

  it('retorna false cuando el servicio retorna false', async () => {
    expect(await verifyAdmin('AdminTest1234', makeService(false))).toBe(false);
  });
});
