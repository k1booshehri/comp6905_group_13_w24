import { Controller, Get, Req, Post, Body, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('all-routes')
  getAllRoutesOverview(): string {
    const overview = this.appService.getAllRoutesOverview();
    return JSON.stringify({
      message: 'All Available Routes Overview',
      nodes: overview.nodes,
      levels: overview.levels,
      routes: overview.edges,
    });
  }

  @Post('find-routes')
  findRoutes(@Body() body: { start: string; end: string; levels: string[] }) {
    return this.appService.findRoutes(body.start, body.end, body.levels);
  }
}
