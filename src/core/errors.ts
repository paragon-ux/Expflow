export class ExpflowError extends Error {
  readonly code: string;
  readonly recoverable: boolean;
  readonly recommendedAction: string | null;

  constructor(
    code: string,
    message: string,
    options: { recoverable?: boolean; recommendedAction?: string | null } = {},
  ) {
    super(message);
    this.name = 'ExpflowError';
    this.code = code;
    this.recoverable = options.recoverable ?? false;
    this.recommendedAction = options.recommendedAction ?? null;
  }
}

export function toExpflowError(error: unknown): ExpflowError {
  if (error instanceof ExpflowError) {
    return error;
  }
  if (error instanceof Error) {
    return new ExpflowError('operation_failed', error.message, { recoverable: false });
  }
  return new ExpflowError('operation_failed', String(error), { recoverable: false });
}
