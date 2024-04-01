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
    const uniquePaths = new Set<string>(); // To store unique paths
  
    const dfs = (node: string, path: Edge[]) => {
      if (node === end) {
        const { totalTime, totalDistance, categories } = this.calculatePathDetails(path, level);
        const pathKey = path.map(edge => edge.name).join('-'); // Generating a unique key for the path
        if (!uniquePaths.has(pathKey)) { // Check if path is unique
          routes.push({ path: [...path], totalTime, totalDistance, categories });
          uniquePaths.add(pathKey); // Add path key to set
        }
        return;
      }
  
      visited.add(node);
      const edges = this.adjList.get(node) || [];
  
      for (const edge of edges) {
        if (!visited.has(edge.end) && (edge.level === level || isLift(edge))) {
          // Apply level filtering for slopes only; include all lifts regardless of their level
          dfs(edge.end, [...path, edge]);
        }
      }
  
      visited.delete(node);
    };
  
    dfs(start, []);
  
    if (routes.length === 0) { // Check if no routes are found
      return { message: "No path found with given conditions", routes: [] };
    }
  
    // Here, directly incorporate a basic categorization logic before returning the results
    // For simplicity, this example does not include a separate categorizeRoutes method
    routes.forEach(route => {
      // Simple example of categorization logic, adjust according to your needs
      route.category = route.totalDistance > 1000 ? "Long route" : "Short route";
    });
  
    return {
      message: "Routes Overview",
      routes: routes.map(route => ({
        path: route.path.map(edge => ({
          start: edge.start,
          end: edge.end,
          name: edge.name,
          difficulty: edge.level,
          time: edge.time,
          distance: edge.distance,
          type: edge.type,
          isLift: isLift(edge)
        })),
        totalTime: route.totalTime,
        totalDistance: route.totalDistance,
        categories: route.categories,
        category: route.category // Include the direct category assignment here
      }))
    };  
  }
  
  private calculatePathDetails(path: Edge[], requestedLevel: Level) {
    let totalTime = 0;
    let totalDistance = 0;
    let categories = []; // Initialize categories array
  
    // Calculate totalTime and totalDistance as before
    for (const edge of path) {
      if (isLift(edge)) {
          // If it's a lift, add its time to totalTime
          totalTime += edge.time;
      } else {
          // If it's a slope, calculate time based on distance and add to totalTime
          // and also add its distance to totalDistance
          totalTime += edge.distance / 840; // Slope time calculation: distance / 840 to convert to minutes
          totalDistance += edge.distance;
      }
    }
  
    // Example categorization based on totalDistance (you can adjust this logic)
    if (totalDistance > 2000) {
      categories.push("Long");
    } else {
      categories.push("Short");
    }
  
    return { totalTime, totalDistance, categories };
  }

}