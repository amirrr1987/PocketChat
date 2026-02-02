import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('connected')
  @ApiOperation({
    summary: 'Check if the API is connected',
    description: 'Check if the API is connected',
  })
  @ApiResponse({
    status: 200,
    description: 'API is connected',
  })
  isConnected(): boolean {
    return this.appService.isConnected();
  }
}
