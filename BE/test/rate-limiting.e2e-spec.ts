import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Rate Limiting (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should block the 6th request to /v1/auth/login within 1 minute', async () => {
    // AuthController /login has @Throttle({ default: { limit: 5, ttl: 60000 } })
    // Send 5 requests, they should not be 429
    for (let i = 0; i < 5; i++) {
      const res = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({});
      expect(res.status).not.toBe(429);
    }

    // The 6th request must be blocked
    const resBlocked = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({});
    expect(resBlocked.status).toBe(429);
  });
});
