import { Edge, Level } from './edge.model';

export class Graph {
  public nodes: Set<string> = new Set();
  public adjList: Map<string, Edge[]> = new Map();

  public addNode(node: string): void {
    this.nodes.add(node);
    this.adjList.set(node, []);
  }

  public addEdge(edge: Edge): void {
    // Since the graph is bidirectional, we need to ensure there is an edge
    // in both directions with the same properties.
    if (!this.adjList.has(edge.start)) {
      this.addNode(edge.start);
    }
    if (!this.adjList.has(edge.end)) {
      this.addNode(edge.end);
    }

    // Add the edge from start to end
    this.adjList.get(edge.start).push(edge);

    // If it's a lift, we add a reverse edge to make it bidirectional.
    // For slopes, we assume they are unidirectional unless otherwise required.
    if (edge.isLift) {
      // Add an edge in the opposite direction with the same properties.
      this.adjList.get(edge.end).push(
        new Edge(edge.end, edge.start, edge.time, edge.distance) // No need for 'level' or 'isLift'
      );
    }
  }

  // A method to get all the edges from a given node
  public getEdges(node: string): Edge[] {
    return this.adjList.get(node) || [];
  }

  // Method to get all edges in the graph
  public getAllEdges(): Edge[] {
    const allEdges: Edge[] = [];
    this.adjList.forEach((edges) => {
      allEdges.push(...edges);
    });
    return allEdges;
  }

  // Method for finding routes
  /*
  //Gives Error
  public findRoutes(start: string, end: string, level?: Level): Edge[] {
    const routes: Edge[] = [];
    const startEdges = this.adjList.get(start) || [];
    for (const edge of startEdges) {
      if (edge.end === end && (level === undefined || edge.level === level)) {
        routes.push(edge);
      }
    }
    return routes;
  }*/

  /*
  //Gives empty JSON
  public findRoutes(start: string, end: string, level?: Level): Edge[] {
    // Initialize routes array to hold matching edges
    const routes: Edge[] = [];
    // Retrieve all edges starting from the 'start' node
    const startEdges = this.adjList.get(start) || [];
    
    // First, try to find slopes that match the specified level
    for (const edge of startEdges) {
      if (edge.end === end && edge.level === level) {
        routes.push(edge);
      }
    }

    // If no slopes were found and a level was specified, try to find a lift
    if (routes.length === 0 && level) {
      for (const edge of startEdges) {
        if (edge.end === end && edge.isLift) {
          routes.push(edge);
        }
      }
    }

    // If no level was specified, add all edges including lifts
    if (level === undefined) {
      for (const edge of startEdges) {
        if (edge.end === end) {
          routes.push(edge);
        }
      }
    }

    return routes;
  }
  */

  public findRouteWithFallback(start: string, end: string, level?: Level): { path: Edge[], totalTime: number, totalDistance: number } {
    // Objects to store visited nodes and the path to reach them
    const visited = new Set<string>();
    const prev = new Map<string, Edge>();

    // Queue for BFS, stores the node and the level of slopes used to reach it
    const queue: { node: string, levelUsed: boolean }[] = [{ node: start, levelUsed: false }];

    while (queue.length > 0) {
      const { node, levelUsed } = queue.shift();
      
      // If the node is the destination, build and return the path
      if (node === end) {
        const path = this.reconstructPath(prev, end);
        let totalTime = 0;
        let totalDistance = 0;

        for (const edge of path) {
          totalTime += edge.time;
          totalDistance += edge.distance;
        }

        return { path, totalTime, totalDistance };
      }

      visited.add(node);

      const edges = this.adjList.get(node);
      if (!edges) continue;

      for (const edge of edges) {
        // If the edge leads to an unvisited node and (the level matches or a lift is being used)
        if (!visited.has(edge.end) && (edge.level === level || edge.isLift)) {
          visited.add(edge.end);
          prev.set(edge.end, edge); // Record the edge used to reach the end node

          // Enqueue the node for further exploration
          queue.push({ node: edge.end, levelUsed: levelUsed || edge.level === level });
        }
      }
    }

    // If the end is not reached, return an empty path
    return { path: [], totalTime: 0, totalDistance: 0 };
  }

  private reconstructPath(prev: Map<string, Edge>, end: string): Edge[] {
    const path = [];
    let at = end;

    while (prev.has(at)) {
      const edge = prev.get(at);
      path.unshift(edge);
      at = edge.start; // Go to the starting node of this edge
    }

    return path;
  }


}
