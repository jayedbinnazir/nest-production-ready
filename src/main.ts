import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { CustomExceptionFilter } from './common/filters/global-exception.filter';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new CustomExceptionFilter(httpAdapterHost));

  const configservice = app.get(ConfigService);
  const PORT = configservice.get<number>('app.port') as number;
  const HOST = configservice.get<string>('app.host') as string;
  const APP_NAME = configservice.get<string>('app.name') ?? 'Retailer API';
  const PREFIX = configservice.get<string>('app.globalPrefix') as string;

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.setGlobalPrefix(PREFIX);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Retailer Sales Representative API')
    .setDescription(
      'Backend APIs for managing retailers, sales representatives, and administrative workflows.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'jwt-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${PREFIX}/docs`, app, document);

  await app.listen(PORT, HOST, () => {
    console.log(`${APP_NAME} is running on ${HOST}:${PORT}`);
  });
}
void bootstrap();
