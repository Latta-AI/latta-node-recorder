import { Controller, Get, NotFoundException } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'Hello world';
  }

  @Get('error/generic')
  getError() {
    console.warn("Generic error will be thrown")
    throw new Error('Generic error');
  }

  @Get('error/not-found')
  getNotFoundError() {
    console.warn("NotFound error will be thrown")
    throw new NotFoundException();
  }
}
