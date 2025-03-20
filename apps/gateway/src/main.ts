import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as hbs from 'express-handlebars';

async function bootstrap() {
  console.log("env in bootstrap", process.env)
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    snapshot: true,
    cors: true
  });

  // const bot = app.get(getBotToken());
  const configService = app.get(ConfigService);
  const config = new DocumentBuilder()
    .setTitle('OAuth2 Server')
    .setDescription('OAuth 2.0 Authentication Server')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useStaticAssets(join(__dirname, '..', '..', 'public'), { prefix: '/public/' });

  const instance = hbs.create({
    extname: 'hbs',
    defaultLayout: 'layout_main',
    layoutsDir: join(__dirname, '..', 'views', 'layouts'),
    partialsDir: join(__dirname, '..', 'views', 'partials'),
  });


  app.engine(
    'hbs',
    instance.engine
  );
  app.setViewEngine('hbs');
  app.enableCors(
    {
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    }
  );
  await app.listen(process.env.PORT! ?? 3004, '0.0.0.0');
}
bootstrap();
