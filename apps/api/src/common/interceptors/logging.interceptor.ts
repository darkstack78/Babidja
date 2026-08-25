import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Request, Response } from 'express';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user';

/**
 * BACK-03 : Intercepteur de logging structur\u00e9 des requ\u00eates HTTP.
 * Enregistre : m\u00e9thode, chemin, dur\u00e9e, code HTTP, userId (si authentifi\u00e9).
 * Utile pour le debugging en production, le monitoring et l'audit de s\u00e9curit\u00e9.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request & { user?: AuthenticatedUser }>();
    const res = ctx.getResponse<Response>();
    const { method, url } = req;
    const userAgent = req.get('user-agent') ?? '-';
    const userId = req.user?.userId ?? 'anonymous';
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - start;
          this.logger.log(
            `${method} ${url} ${res.statusCode} +${ms}ms [user:${userId}] [ua:${userAgent.substring(0, 40)}]`,
          );
        },
        error: () => {
          const ms = Date.now() - start;
          this.logger.warn(
            `${method} ${url} ERR +${ms}ms [user:${userId}]`,
          );
        },
      }),
    );
  }
}
