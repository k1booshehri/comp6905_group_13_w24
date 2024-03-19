import { Controller, Get, Req, Post, Body, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { Edge, Level } from './route/models/edge.model';

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
  /*
  getAllRoutes(): string {
    const routes = this.appService.getAllRoutes();
    return JSON.stringify({
      message: 'All Available Routes',
      routes: routes,
    });
    
  }
*/



  @Get()
  getDefaultRoute(
    @Query('start') start: string = 'A',
    @Query('end') end: string = 'R',
    @Query('level') level: Level = 'blue'
  ): string {
    // Calls the method with the default parameters or with the provided query parameters
    const result = this.appService.findRoutesWithFallback(start, end, level);
    return JSON.stringify({
      message: 'Default Route',
      path: result.path,
      totalTime: result.totalTime,
      totalDistance: result.totalDistance,
    });
  }

  @Post('get-path')
  getPath(@Body() request: Edge): JSON{
    return this.appService.getPath(request);
  }
}
