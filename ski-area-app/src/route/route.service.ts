// src/route/route.service.ts
import { Injectable } from '@nestjs/common';
import { Graph } from './models/graph.model';
import { Edge, Level } from './models/edge.model';

@Injectable()
export class RouteService {
  private graph: Graph;

  constructor() {
    this.graph = new Graph();
    this.initializeSampleGraph();
  }

  private initializeSampleGraph(): void {
    // Add nodes
    this.graph.addNode('A');
    this.graph.addNode('B');
    this.graph.addNode('C');
    this.graph.addNode('D');
    this.graph.addNode('R');


    // Add bidirectional edges
    this.graph.addEdge(new Edge('A', 'B', 15, 200)); // A-B - Lift
    this.graph.addEdge(new Edge('B', 'A', 10, 200, 'red')); // B-A - route
    this.graph.addEdge(new Edge('B', 'C', 10, 120));
    this.graph.addEdge(new Edge('C', 'B', 8, 150, 'blue')); 
    this.graph.addEdge(new Edge('B', 'D', 10, 250, 'black')); 
    this.graph.addEdge(new Edge('C', 'D', 25, 350, 'blue')); 
    this.graph.addEdge(new Edge('D', 'C', 12, 200));
    this.graph.addEdge(new Edge('D', 'R', 8, 150));
    this.graph.addEdge(new Edge('C', 'R', 20, 350, 'black')); 
    this.graph.addEdge(new Edge('C', 'R', 25, 450, 'blue')); 
    this.graph.addEdge(new Edge('C', 'R', 22, 400, 'red')); 
  }

  // Method to get all routes/edges
  public getAllRoutes(): Edge[] {
    return this.graph.getAllEdges(); // Assuming Graph class has getAllEdges method
  }


  public getAllRoutesOverview(): { nodes: string[], levels: Level[], edges: Edge[] } {
    // This calls the new method from the Graph class
    return this.graph.getAllEdgesWithOverview();
  }

  /*
  public findRoutesWithFallback(start: string, end: string, level?: Level): { path: Edge[], totalTime: number, totalDistance: number } {
    return this.graph.findRouteWithFallback(start, end, level);
  }*/

  public findAllRoutes(start: string, end: string): { message: string, routes: any[] } {
  return this.graph.findAllRoutes(start, end);
}

}
