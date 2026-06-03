// REGLA: único lugar donde se define AsyncStatus en todo el proyecto — nunca redefinir
export type AsyncStatus = 'idle' | 'pending' | 'success' | 'error';
export type HydrationStatus = AsyncStatus;

// Estados de la máquina de inicialización (ADR-006)
export type InitState = 'UNINITIALIZED' | 'LOADING_DB' | 'HYDRATING_STORE' | 'READY' | 'ERROR';
