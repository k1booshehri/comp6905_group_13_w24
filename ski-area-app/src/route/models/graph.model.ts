import { Edge, Level, LiftType, isLift } from './edge.model';

export class Graph {
  public nodes: Set<string> = new Set();
  public adjList: Map<string, Edge[]> = new Map();

  public addNode(node: string): void {
    try {
      this.nodes.add(node);
      this.adjList.set(node, []);
    } catch (error) {
      console.error('Failed to add node:', error);
    }
  }

  public addEdge(edge: Edge): void {
    try {
      if (!this.adjList.has(edge.start)) {
        this.addNode(edge.start);
      }
      if (!this.adjList.has(edge.end)) {
        this.addNode(edge.end);
      }

      this.adjList.get(edge.start)?.push(edge);

      if (isLift(edge)) {
        this.adjList.get(edge.end)?.push(
          new Edge(edge.name, edge.end, edge.start, edge.time, edge.distance, edge.level, edge.type)
        );
      }
    } catch (error) {
      console.error('Failed to add edge:', error);
    }
  }

  public getEdges(node: string): Edge[] {
    try {
      return this.adjList.get(node) || [];
    } catch (error) {
      console.error('Failed to get edges for node:', error);
      return [];
    }
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


  public findAllRoutes(start: string, end: string, level: Level): { message: string, unique_categories: string[], routes: any[] } {
    try {
      let routes = [];
      const visited = new Set<string>();
      const uniquePaths = new Set<string>(); // To store unique paths

      const dfs = (node: string, path: Edge[], liftCount = 0) => {
        if (node === end) {
          const { totalTime, totalDistance, categories, finalDistance } = this.calculatePathDetails(path, level);
          const pathKey = path.map(edge => edge.name).join('-'); // Generating a unique key for the path
          if (!uniquePaths.has(pathKey)) { // Check if path is unique
            routes.push({ path: [...path], totalTime, totalDistance, categories, finalDistance, liftCount });
            uniquePaths.add(pathKey); // Add path key to set
          }
          return;
        }

        visited.add(node);
        const edges = this.adjList.get(node) || [];

        for (const edge of edges) {
          if (!visited.has(edge.end) && (edge.level === level || isLift(edge))) {
            dfs(edge.end, [...path, edge], liftCount + (isLift(edge) ? 1 : 0));
          }
        }

        visited.delete(node);
      };

      dfs(start, []);

      if (routes.length === 0) {
        return { message: "No path found with given conditions, Please select another level and check. Or Change starting or Ending Point.", unique_categories: [], routes: [] };
      }

      this.categorizeAndCompareRoutes(routes);

      // Collect unique categories
      const uniqueCategories = new Set<string>();
      routes.forEach(route => {
        route.categories.forEach(category => {
          uniqueCategories.add(category);
        });
      });

      return {
        message: "Routes Overview",
        unique_categories: Array.from(uniqueCategories),
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
          finalDistance: route.finalDistance,
          categories: route.categories,
          liftCount: route.liftCount
        }))
      };
    } catch (error) {
      console.error('Failed to find all routes:', error);
      return { message: "Error finding routes.", unique_categories: [], routes: [] };
    }
  }


  private calculatePathDetails(path: Edge[], requestedLevel: Level): { totalTime: number, totalDistance: number, categories: string[], finalDistance: number, liftCount: number } {
    let totalTime = 0;
    let totalDistance = 0;
    let liftCount = 0;
    let difficultyFactor = 0;

    for (const edge of path) {
      if (isLift(edge)) {
        liftCount += 1;
        totalTime += edge.time;
        totalDistance += edge.distance;
      } else {
        totalTime += edge.distance / 840; // Slope time calculation: distance / 840 to convert to minutes
        totalDistance += edge.distance;
        difficultyFactor += edge.level === 'Easy' ? 0.5 : edge.level === 'Intermediate' ? 1 : 1.5;
      }
    }

    const finalDistance = totalDistance * difficultyFactor;

    return { totalTime, totalDistance, categories: [], finalDistance, liftCount };
  }

  private categorizeAndCompareRoutes(routes: any[]) {
    // Initialize variables to find the extremes
    let minTime = Infinity, maxDistance = 0, minLiftCount = Infinity;
    let minFinalDistance = Infinity, maxFinalDistance = 0;

    // First pass to find the extreme values
    for (const route of routes) {
      minTime = Math.min(minTime, route.totalTime);
      maxDistance = Math.max(maxDistance, route.totalDistance);
      minLiftCount = Math.min(minLiftCount, route.liftCount);
      minFinalDistance = Math.min(minFinalDistance, route.finalDistance);
      maxFinalDistance = Math.max(maxFinalDistance, route.finalDistance);
    }

    // Second pass to assign categories based on the extremes
    routes.forEach(route => {
      route.categories = [];
      if (route.finalDistance === minFinalDistance) route.categories.push('Easiest');
      if (route.finalDistance === maxFinalDistance) route.categories.push('Hardest');
      if (route.totalDistance === maxDistance) route.categories.push('Longest');
      if (route.totalTime === minTime) route.categories.push('Fastest');
      if (route.liftCount === minLiftCount) route.categories.push('Minimum Lift Usage');
    });
  }

}
