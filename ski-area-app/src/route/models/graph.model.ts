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


  public getAllEdgesWithOverview(): { nodes: string[], levels: Level[], edges: Edge[] } {
    const levelsSet: Set<Level> = new Set();
  
    // Iterate over the adjacency list to fill levelsSet with unique levels (excluding null values) and allEdges with edges
    this.adjList.forEach(edges => {
      edges.forEach(edge => {
        // Check if edge.level is not null before adding it to the set
        if (edge.level !== null && edge.level !== undefined) {
          levelsSet.add(edge.level);
        }
      });
    });
  
    const nodesArray = Array.from(this.nodes);
    const levelsArray = Array.from(levelsSet);
    const allEdges = this.getAllEdges();
  
    return { nodes: nodesArray, levels: levelsArray, edges: allEdges };
  }
  


  public getGraphOverview(): { nodes: string[], levels: Level[], edges: Edge[] } {
    // Initialize a Set to store all unique levels
    const levelsSet: Set<Level> = new Set();
  
    // Iterate over all edges to extract unique levels
    this.adjList.forEach(edges => {
      edges.forEach(edge => {
        levelsSet.add(edge.level);
      });
    });
  
    // Convert the nodes Set and levels Set to arrays for JSON compatibility
    const nodesArray = Array.from(this.nodes);
    const levelsArray = Array.from(levelsSet);
  
    // Also, let's get all the edges for completeness
    const allEdges = this.getAllEdges();
  
    // Return an object containing nodes, levels, and all edges
    return { nodes: nodesArray, levels: levelsArray, edges: allEdges };
  }

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