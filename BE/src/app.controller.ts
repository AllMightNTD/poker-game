import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('🏥 System')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Get('health')
  @ApiOperation({
    summary: 'System Info & Health Check',
    description:
      'Returns system information including version, uptime, environment, and real-time connectivity status of Database and Redis.',
  })
  @ApiResponse({
    status: 200,
    description: 'System health information',
    schema: {
      example: {
        status: 'ok',
        name: 'Poker Platform API',
        version: '1.0.0',
        environment: 'development',
        uptime: '2h 15m 30s',
        timestamp: '2026-07-16T15:00:00.000Z',
        services: {
          database: 'connected',
          redis: 'connected',
        },
      },
    },
  })
  async getSystemInfo() {
    return this.appService.getSystemInfo();
  }
}
