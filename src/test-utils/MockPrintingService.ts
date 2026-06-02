/**
 * MockPrintingService — Test double para IPrintingService
 *
 * PRE-SPRINT-0 SCAFFOLD: Generado como artefacto de planificación.
 * Target path: src/test-utils/MockPrintingService.ts
 *
 * Permite testear ChargeNoteUseCase sin hardware real.
 * Implementa IPrintingService para ser inyectado en use cases.
 */

// ─── Types (mirrors src/infrastructure/printing/PrintingService.ts) ──────────
export type PrintingErrorType = 'BT_OFF' | 'RAWBT_NOT_INSTALLED' | 'TIMEOUT' | 'SEND_FAILED';

export type PrintResult = {
  success: boolean;
  error?: PrintingErrorType;
};

// ─────────────────────────────────────────────────────────────────────────────

export class MockPrintingService {
  private _errorToSimulate: PrintingErrorType | null = null;
  public printCalls: unknown[] = [];

  /** Simula un error de impresión para el siguiente llamado a print() */
  simulateError(error: PrintingErrorType): void {
    this._errorToSimulate = error;
  }

  /** Reset al estado sin error */
  reset(): void {
    this._errorToSimulate = null;
    this.printCalls = [];
  }

  /** Implementación del método print() de IPrintingService */
  async print(payload: unknown): Promise<PrintResult> {
    this.printCalls.push(payload);

    if (this._errorToSimulate) {
      const error = this._errorToSimulate;
      this._errorToSimulate = null; // Reset after one use
      return { success: false, error };
    }

    return { success: true };
  }
}
