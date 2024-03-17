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

  /*
  public getRoutes(start: string, end: string, level?: Level): Edge[] {
    return this.routeService.getRoutes(start, end, level);
  }*/

  public findRoutesWithFallback(start: string, end: string, level?: Level): { path: Edge[], totalTime: number, totalDistance: number } {
    return this.routeService.findRoutesWithFallback(start, end, level);
  }


  getPath(request): JSON{
    let a = [];
    let graph = new Graph();
    a['path'] = []; //dijkstra theke jeta return korbe ota hbe a value or call dijkstra function here
    return JSON.parse(JSON.stringify(a));
  }

}
