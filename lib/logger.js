
import pino from 'pino';
import pinoHttp from 'pino-http';
import { XRPCError } from '@atproto/xrpc-server';

export const pdsLogger = pino();
export const loggerMiddleware = pinoHttp({ logger: pdsLogger });

export const errorHandler = (err, req, res, next) => {
  req.log.error(err, 'internal server error');
  if (res.headersSent) return next(err);
  const serverError = XRPCError.fromError(err);
  res.status(serverError.type).json(serverError.payload);
}
