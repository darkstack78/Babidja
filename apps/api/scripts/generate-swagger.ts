import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import * as fs from 'fs';

async function generateSwagger() {
  const app = await NestFactory.create(AppModule);
  
  const config = new DocumentBuilder()
    .setTitle('Babydja API')
    .setDescription('API de réservation Babydja — hôtels et véhicules')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  fs.writeFileSync('swagger.json', JSON.stringify(document, null, 2));
  console.log('Swagger documentation generated successfully.');
  await app.close();
}

generateSwagger();
