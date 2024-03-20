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

  public getAllRoutesOverview(): { nodes: string[], levels: Level[], edges: Edge[] } {
    // Call the new method in RouteService
    return this.routeService.getAllRoutesOverview();
  }

  public findAllRoutes(start: string, end: string): { message: string, routes: any[] } {
    return this.routeService.findAllRoutes(start, end);
  }


  getPath(request): JSON{
    let a = [];
    let graph = new Graph();
    a['path'] = []; //dijkstra theke jeta return korbe ota hbe a value or call dijkstra function here
    return JSON.parse(JSON.stringify(a));
  }

}
