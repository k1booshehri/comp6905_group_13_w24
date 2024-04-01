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

  /*
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
  */
  
  public getAllEdgesWithOverview(): { nodes: string[], levels: Level[], types: LiftType[], edges: Edge[] } {
    const levelsSet: Set<Level> = new Set();
    const typesSet: Set<LiftType> = new Set();
    const uniqueLifts = new Set<string>(); // Use to track which lifts have been added

    // Adjusted scope for these arrays
    const nodesArray = Array.from(this.nodes);
    const allEdges = this.getAllEdges().filter(edge => {
        // For lifts, check and include only one direction
        if (isLift(edge)) {
            if (uniqueLifts.has(edge.name)) {
                return false; // This lift (in one direction) is already included
            }
            uniqueLifts.add(edge.name); // Mark this lift as included
        }
        // Collect levels and types
        if (edge.level) levelsSet.add(edge.level);
        if (edge.type) typesSet.add(edge.type);
        return true; // Include this edge
    });

    // Now `levelsArray` and `typesArray` can directly use the sets filled during filtering
    const levelsArray = Array.from(levelsSet);
    const typesArray = Array.from(typesSet);

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

  public findAllRoutes(start: string, end: string, level: Level): { message: string, routes: any[] } {
    let routes = [];
    const visited = new Set<string>();

    const dfs = (node: string, path: Edge[]) => {
      if (node === end) {
        const { totalTime, totalDistance, categories } = this.calculatePathDetails(path, level);
        routes.push({ path: [...path], totalTime, totalDistance, categories });
        return;
      }

      visited.add(node);
      const edges = this.adjList.get(node) || [];

      for (const edge of edges) {
        if (!visited.has(edge.end) && edge.level === level) {
          dfs(edge.end, [...path, edge]);
        }
      }

      visited.delete(node);
    };

    dfs(start, []);

    return {
      message: "Routes Overview",
      routes: routes.map(route => ({
        // Ensure edge is defined before passing to isLift:
        path: route.path.map(edge => ({
          start: edge.start,
          end: edge.end,
          name: edge.name,
          difficulty: edge.level,
          time: edge.time,
          distance: edge.distance,
          type: edge.type,
          isLift: isLift(edge) // Now safely checks if edge is undefined
        })),
        totalTime: route.totalTime,
        totalDistance: route.totalDistance,
        categories: route.categories
      }))
    };
  }

  private calculatePathDetails(path: Edge[], requestedLevel: Level) {
    let totalTime = 0;
    let totalDistance = 0;
    let levelMultiplier = { Easy: 0.5, Intermediate: 1, Difficult: 1.5 };

    for (const edge of path) {
      if (isLift(edge)) {
        totalTime += edge.time;
      } else {
        totalTime += edge.distance / 840; // Slope time calculation
        totalDistance += edge.distance;
      }
    }

    // Categorize
    let categoryMultiplier = totalDistance * levelMultiplier[requestedLevel];
    let categories = ['fastest', 'longest', 'minimum lift usage', 'hardest', 'moderate', 'easiest']; // Simplified categorization example

    return { totalTime, totalDistance, categories };
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
      if (levels.has("Difficult") && (levels.has("Easy") || levels.has("Intermediate"))) {
        route.category.push("hardest");
      } else if (levels.has("Intermediate") || (levels.has("Easy") && levels.has("Intermediate"))) {
        route.category.push("moderate");
      } else if (levels.has("Easy") && levels.size === 1) {
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