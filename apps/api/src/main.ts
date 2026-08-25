import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Sans ça, un SIGTERM (Docker/Coolify à l'arrêt du conteneur) ne déclenche pas
  // les hooks onModuleDestroy (Prisma, Redis, BullMQ) — les connexions seraient
  // coupées brutalement plutôt que fermées proprement.
  app.enableShutdownHooks();

  app.use(helmet());
  app.enableCors({
    // Pas de cookies utilisés (auth par Bearer token uniquement) : credentials
    // inutile ici, et risqué à activer par défaut si des cookies sont ajoutés plus tard.
    origin: [config.get<string>('frontendUrl')!],
  });

  app.setGlobalPrefix('api/v1', { exclude: ['health'] });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const nodeEnv = config.get<string>('nodeEnv') ?? 'development';
  // CRIT-03 : Swagger docs disabled in production — exposes the full attack surface.
  if (nodeEnv !== 'production') {
    const swaggerDocument = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('Babydja API')
        .setDescription('API de r\u00e9servation Babydja \u2014 h\u00f4tels et v\u00e9hicules')
        .setVersion('0.1.0')
        .addBearerAuth()
        .build(),
    );
    SwaggerModule.setup('api/docs', app, swaggerDocument);
  }

  const port = config.get<number>('port') ?? 3001;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(
    `Babydja API démarrée sur http://localhost:${port}/api/v1 (docs: /api/docs, health: /health)`,
  );
}

bootstrap();
