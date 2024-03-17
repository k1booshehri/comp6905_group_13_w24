import { Controller, Get, Req, Post, Body, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { Edge, Level } from './route/models/edge.model';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  
  /*
  @Get() // Changed from @Get('all-routes')
  getAllRoutes(): string {
    const routes = this.appService.getAllRoutes(); // Or this.routeService.getAllRoutes() if injected directly
    return `All Routes: ${JSON.stringify(routes)}`;
  }
  */

  /*
  @Get('find-routes')
  findRoutes(
    @Query('start') start: string = 'A', 
    @Query('end') end: string = 'R', 
    @Query('level') level: Level = 'blue'
  ): string {
    const routes = this.appService.getRoutes(start, end, level);
    return `Default Routes from ${start} to ${end} at level ${level}: ${JSON.stringify(routes)}`;
    //`Filtered Routes: ${JSON.stringify(routes)}`;
  }
  */

  /*
  // This handler will respond to the root path `/`
  @Get()
  getDefaultRoutes(): string {
    // The default values for start, end, and level
    const defaultStart = 'A';
    const defaultEnd = 'R';
    const defaultLevel: Level = 'blue';

    // Fetch the default routes using the RouteService
    const routes = this.appService.getRoutes(defaultStart, defaultEnd, defaultLevel);

    // Return a JSON string of the default routes
    return `Default Routes from ${defaultStart} to ${defaultEnd} at level ${defaultLevel}: ${JSON.stringify(routes)}`;
  }
  */

  /*
  //Error: Not found
  // Endpoint to find routes with fallback to lifts
  @Get('find-route')
  findRoute(
    @Query('start') start: string = 'A',
    @Query('end') end: string = 'R',
    @Query('level') level: Level = 'blue',
  ): string {
    const result = this.appService.findRoutesWithFallback(start, end, level);
    return JSON.stringify({
      message: 'Route found',
      path: result.path,
      totalTime: result.totalTime,
      totalDistance: result.totalDistance,
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
