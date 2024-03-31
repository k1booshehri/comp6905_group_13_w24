import { Edge, Level, LiftType, isLift } from './edge.model';

export class Graph {
  public nodes: Set<string> = new Set();
  public adjList: Map<string, Edge[]> = new Map();
  
  public addNode(node: string): void {
    this.nodes.add(node);
    this.adjList.set(node, []);
  }

  public addEdge(edge: Edge): void {
    if (!this.adjList.has(edge.start)) {
      this.addNode(edge.start);
    }
    if (!this.adjList.has(edge.end)) {
      this.addNode(edge.end);
    }

    this.adjList.get(edge.start).push(edge);

    // For lifts, add a reverse edge to make it bidirectional.
    if (isLift(edge)) {
      // Add the edge in the opposite direction with the same properties.
      this.adjList.get(edge.end).push(
        new Edge(edge.name, edge.end, edge.start, edge.time, edge.distance, edge.level, edge.type)
      );
    }
  }

  public getEdges(node: string): Edge[] {
    return this.adjList.get(node) || [];
  }

  public getAllEdges(): Edge[] {
    const allEdges: Edge[] = [];
    this.adjList.forEach(edges => {
      allEdges.push(...edges);
    });
    return allEdges;
  }

  public getAllEdgesWithOverview(): { nodes: string[], levels: Level[], types: LiftType[], edges: Edge[] } {
    const levelsSet: Set<Level> = new Set();
    const typesSet: Set<LiftType> = new Set();
  
    this.adjList.forEach(edges => {
      edges.forEach(edge => {
        if (edge.level) levelsSet.add(edge.level);
        if (edge.type) typesSet.add(edge.type);
      });
    });
  
    const nodesArray = Array.from(this.nodes);
    const levelsArray = Array.from(levelsSet);
    const typesArray = Array.from(typesSet);
    const allEdges = this.getAllEdges();
  
    return { nodes: nodesArray, levels: levelsArray, types: typesArray, edges: allEdges };
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

  public findAllRoutes(start: string, end: string): { message: string, routes: any[] } {
    let routes = [];
    const visited = new Set<string>();
    const path = [];

    // Helper function to explore all paths recursively
    const dfs = (node: string, path: Edge[], visited: Set<string>) => {
      if (node === end) {
        // Calculate total time and distance for the current path
        const totalTime = path.reduce((acc, edge) => acc + edge.time, 0);
        const totalDistance = path.reduce((acc, edge) => acc + edge.distance, 0);
        
        // Add the current path to the routes array
        routes.push({ path: [...path], totalTime, totalDistance });
        return;
      }

      visited.add(node);
      const edges = this.adjList.get(node);

      if (!edges) return;

      for (const edge of edges) {
        if (!visited.has(edge.end)) {
          // Add current edge to the path and continue DFS
          path.push(edge);
          dfs(edge.end, path, visited);
          path.pop(); // Backtrack to explore other paths
        }
      }

      visited.delete(node);
    };

    dfs(start, path, visited);

    const result = this.processRoutesWithLiftsAndLevels({
      message: "Routes Overview",
      routes: routes.map(route => ({
        path: route.path.map(edge => ({
          start: edge.start,
          end: edge.end,
          time: edge.time,
          distance: edge.distance,
          level: edge.level,
          isLift: edge.isLift
        })),
        totalTime: route.totalTime,
        totalDistance: route.totalDistance
      }))
    });

    return this.categorizeRoutes(result);;
  }

  private processRoutesWithLiftsAndLevels(result: { message: string, routes: any[] }): { message: string, routes: any[] } {
    result.routes.forEach(route => {
      let liftCount = 0;
      const levels = new Set<string>();
      
      route.path.forEach((segment: any) => {
        if (segment.isLift) liftCount++;
        if (segment.level) levels.add(segment.level);
      });

      route.liftCount = liftCount;
      route.distinctLevels = Array.from(levels);
    });

    return result;
  }

  private categorizeRoutes(result: { message: string, routes: any[] }): { message: string, routes: any[] } {
    let fastestTime = Infinity;
    let longestTime = 0;
    let minimumLifts = Infinity;
  
    // First pass to find the extremes
    result.routes.forEach((route, index) => {
      // Fastest
      if (route.totalTime < fastestTime) {
        fastestTime = route.totalTime;
      }
  
      // Longest
      if (route.totalTime > longestTime) {
        longestTime = route.totalTime;
      }
  
      // Minimum lift usage
      if (route.liftCount < minimumLifts) {
        minimumLifts = route.liftCount;
      }
    });
  
    // Assign categories based on new criteria
    result.routes.forEach((route) => {
      // Reset category
      route.category = [];
  
      // Assign fastest, longest, minimum lift usage
      if (route.totalTime === fastestTime) {
        route.category.push("fastest");
      }
      if (route.totalTime === longestTime) {
        route.category.push("longest");
      }
      if (route.liftCount === minimumLifts) {
        route.category.push("minimum lift usage");
      }
  
      // Determine difficulty level
      const levels = new Set(route.distinctLevels);
      if (levels.has("black") && (levels.has("blue") || levels.has("red"))) {
        route.category.push("hardest");
      } else if (levels.has("red") || (levels.has("blue") && levels.has("red"))) {
        route.category.push("moderate");
      } else if (levels.has("blue") && levels.size === 1) {
        route.category.push("easiest");
      }
  
      // Combine categories for scenic and difficulty levels with minimum lift usage
      if (route.totalDistance > 0 && route.path.some(segment => segment.isLift) && route.path.some(segment => !segment.isLift)) {
        route.category.push("most scenic");
      }
  
      // Finalize the category by joining multiple conditions, if any
      if (route.category.length > 1) {
        const isMinimumLiftUsageIncluded = route.category.includes("minimum lift usage");
        route.category = route.category.filter(cat => cat !== "minimum lift usage");
  
        // Append "with minimum lift usage" if applicable
        if (isMinimumLiftUsageIncluded) {
          route.category[route.category.length - 1] += " with minimum lift usage";
        }
      } else if (route.category.length === 1) {
        route.category = route.category[0];
      } else {
        route.category = "unclassified"; // Fallback in case no category fits
      }
    });
  
    return result;
  }
  
  

}