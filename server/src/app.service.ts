import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  isConnected(): boolean {
    return true;
  }
}
