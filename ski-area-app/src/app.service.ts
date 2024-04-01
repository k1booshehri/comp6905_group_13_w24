import { Injectable } from '@nestjs/common';
import { Graph } from './route/models/graph.model';
import { Edge, Level } from './route/models/edge.model';
import { RouteService } from './route/route.service';

@Injectable()
export class AppService {
  
  constructor(private routeService: RouteService) {}
  
  // Method to get all routes
  public getAllRoutes(): Edge[] {
    return this.routeService.getAllRoutes();
  }

  //for getting the all routs
  public getAllRoutesOverview(): { nodes: string[], levels: Level[], edges: Edge[] } {
    // Call the new method in RouteService
    return this.routeService.getAllRoutesOverview();
  }

  public findRoutes(start: string, end: string, level: string) {
    return this.routeService.findRoutes(start, end, level);
  }


}
