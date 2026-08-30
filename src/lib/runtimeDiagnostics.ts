export type RuntimePhase = 'caught-render' | 'recoverable-render' | 'uncaught-render';

export function reportRuntimeError(error: unknown, phase: RuntimePhase): void {
  const errorType = error instanceof Error ? error.name : typeof error;
  window.dispatchEvent(
    new CustomEvent('nymrel:runtime-error', {
      detail: { errorType, phase },
    }),
  );
}
