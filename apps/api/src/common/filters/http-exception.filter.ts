import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

function mapPrismaError(exception: Prisma.PrismaClientKnownRequestError): {
  status: number;
  message: string;
} {
  switch (exception.code) {
    case 'P2002': {
      const target = (exception.meta?.target as string[] | undefined)?.join(', ');
      return {
        status: HttpStatus.CONFLICT,
        message: target
          ? `Une ressource avec cette valeur existe déjà (${target}).`
          : 'Cette ressource existe déjà.',
      };
    }
    case 'P2025':
      return { status: HttpStatus.NOT_FOUND, message: 'Ressource introuvable.' };
    case 'P2003':
      return { status: HttpStatus.BAD_REQUEST, message: 'Référence invalide.' };
    default:
      return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Erreur interne.' };
  }
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: unknown;

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const mapped = mapPrismaError(exception);
      status = mapped.status;
      message = mapped.message;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
    }

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      message,
    });
  }
}
