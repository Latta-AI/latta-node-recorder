import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LattaInterceptor } from '@latta/nestjs';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new LattaInterceptor(process.env.LATTA_API_KEY));

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT, () => {
    Logger.log(`Listening on *:${PORT}`, 'Main');
  });
}
bootstrap();
