import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { SeedService } from './seed.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const seedService = app.get(SeedService);
  await seedService.seedAll();

  await app.close();
  console.log('Seed application finished.');
  process.exit(0);
}

bootstrap();
