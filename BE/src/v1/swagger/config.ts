import { DocumentBuilder } from '@nestjs/swagger';

export const config = new DocumentBuilder()
  .setTitle('Swagger Documentation')
  .setDescription('The App API description')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'Enter JWT token, e.g. "Bearer <token>"',
      in: 'header',
    },
    'access-token',
  )
  .build();
