import type { NextFunction, Request, RequestHandler, Response } from 'express';

/** Erro HTTP com status — lançado nas rotas e tratado no errorHandler central. */
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Express 4 não captura promessas rejeitadas: este wrapper repassa o erro ao next(). */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };
