/**
 * ATDD Red-Phase Scaffolds — Story 1.4: AdminAuthService
 *
 * PRE-SPRINT-0 SCAFFOLD: Generado como artefacto de planificación.
 * Target path: src/infrastructure/auth/__tests__/AdminAuthService.test.ts
 *
 * TDD RED PHASE: Todos los tests están en it.skip().
 * Activar uno por uno durante la implementación de Story 1.4.
 *
 * @group p0
 * @group security
 * @group admin-auth
 */

import { AdminAuthService } from '../AdminAuthService';
import * as FileSystem from 'expo-file-system/legacy';
import * as Crypto from 'expo-crypto';

const TEST_ADMIN_SALT = 'test-salt-for-unit-tests-only-never-production';
const TEST_ADMIN_NAME = 'AdminTest1234';
const EXPECTED_HASH = 'mocked-sha256-hash-for-admintest1234';

describe('Story 1.4 — AdminAuthService @P0 @Security', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────
  // AC-AUTH-04: admin.config.json ausente → retorna false, app continúa
  // ─────────────────────────────────────────────────────────────────
  it('[P0] verify() sin admin.config.json → retorna false, sin crash, app continúa en modo Operador', async () => {
    jest.spyOn(FileSystem, 'getInfoAsync').mockResolvedValue({ exists: false } as any);

    const service = new AdminAuthService({ salt: TEST_ADMIN_SALT });
    await expect(service.verify('AlgunNombre123')).resolves.toBe(false);
  });

  // ─────────────────────────────────────────────────────────────────
  // AC-AUTH-03: Nombre incorrecto → retorna false, sin revelar existencia
  // ─────────────────────────────────────────────────────────────────
  it('[P0] verify(nombre_incorrecto) → retorna false, sin revelar que Admin existe', async () => {
    jest.spyOn(FileSystem, 'getInfoAsync').mockResolvedValue({ exists: true } as any);
    jest.spyOn(FileSystem, 'readAsStringAsync').mockResolvedValue(
      JSON.stringify({ adminHash: EXPECTED_HASH })
    );
    jest.spyOn(Crypto, 'digestStringAsync').mockResolvedValue('otro-hash-diferente');

    const service = new AdminAuthService({ salt: TEST_ADMIN_SALT });
    const result = await service.verify('UsuarioEquivocado123');

    expect(result).toBe(false);
  });

  // ─────────────────────────────────────────────────────────────────
  // AC-AUTH-01: Nombre correcto → retorna true
  // ─────────────────────────────────────────────────────────────────
  it('[P0] verify(nombre_correcto) → retorna true', async () => {
    jest.spyOn(FileSystem, 'getInfoAsync').mockResolvedValue({ exists: true } as any);
    jest.spyOn(FileSystem, 'readAsStringAsync').mockResolvedValue(
      JSON.stringify({ adminHash: EXPECTED_HASH })
    );
    jest.spyOn(Crypto, 'digestStringAsync').mockResolvedValue(EXPECTED_HASH);

    const service = new AdminAuthService({ salt: TEST_ADMIN_SALT });
    const result = await service.verify(TEST_ADMIN_NAME);

    expect(result).toBe(true);
  });

  // ─────────────────────────────────────────────────────────────────
  // AC-AUTH-05: Hash comparison usa sha256(name.toLowerCase().trim() + ADMIN_SALT)
  // ─────────────────────────────────────────────────────────────────
  it('[P0] hash comparison: sha256(name.toLowerCase().trim() + ADMIN_SALT) — case insensitive', async () => {
    jest.spyOn(FileSystem, 'getInfoAsync').mockResolvedValue({ exists: true } as any);
    jest.spyOn(FileSystem, 'readAsStringAsync').mockResolvedValue(
      JSON.stringify({ adminHash: EXPECTED_HASH })
    );

    const digestSpy = jest.spyOn(Crypto, 'digestStringAsync').mockImplementation(
      async (_alg, data) => {
        if (data === 'admintest1234' + TEST_ADMIN_SALT) {
          return EXPECTED_HASH;
        }
        return 'otro-hash';
      }
    );

    const service = new AdminAuthService({ salt: TEST_ADMIN_SALT });

    expect(await service.verify('  AdminTest1234  ')).toBe(true);
    expect(await service.verify('ADMINTEST1234')).toBe(true);
    expect(await service.verify('admintest1234')).toBe(true);

    const calls = digestSpy.mock.calls.map(([, data]) => data);
    calls.forEach(data => {
      expect(data).toBe('admintest1234' + TEST_ADMIN_SALT);
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // AC-AUTH-02: El nombre del admin NUNCA aparece en logs/consola
  // ─────────────────────────────────────────────────────────────────
  it('[P0] verify() — nombre del Admin NUNCA aparece en console, logs ni errores', async () => {
    jest.spyOn(FileSystem, 'getInfoAsync').mockResolvedValue({ exists: true } as any);
    jest.spyOn(FileSystem, 'readAsStringAsync').mockResolvedValue(
      JSON.stringify({ adminHash: EXPECTED_HASH })
    );
    jest.spyOn(Crypto, 'digestStringAsync').mockResolvedValue(EXPECTED_HASH);

    const consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(() => {}),
      warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
      error: jest.spyOn(console, 'error').mockImplementation(() => {}),
    };

    const service = new AdminAuthService({ salt: TEST_ADMIN_SALT });
    await service.verify(TEST_ADMIN_NAME);
    await service.verify('UsuarioEquivocado');

    const allConsoleCalls = [
      ...consoleSpy.log.mock.calls.flat(),
      ...consoleSpy.warn.mock.calls.flat(),
      ...consoleSpy.error.mock.calls.flat(),
    ].join(' ');

    expect(allConsoleCalls).not.toContain(TEST_ADMIN_NAME);
    expect(allConsoleCalls).not.toContain(TEST_ADMIN_NAME.toLowerCase());

    Object.values(consoleSpy).forEach(spy => spy.mockRestore());
  });

  // ─────────────────────────────────────────────────────────────────
  // AC-AUTH-06: android:allowBackup=false en AndroidManifest
  // (Ya implementado en app.config.js — no requiere test activo)
  // ─────────────────────────────────────────────────────────────────
  it.skip('[P1] app.config.js tiene android.allowBackup=false via config plugin', () => {
    expect(true).toBe(false); // ← PLACEHOLDER
  });

});
