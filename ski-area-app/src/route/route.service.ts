// src/route/route.service.ts
import { Injectable } from '@nestjs/common';
import { Edge, Level, isLift } from './models/edge.model';
import { Graph } from './models/graph.model';

@Injectable()
export class RouteService {
  private graph: Graph;

  constructor() {
    try {
      this.graph = new Graph();
      this.initializeSampleGraph();
    } catch (error) {
      console.error('Failed to initialize graph', error);
      throw error;
    }
  }

  // private isLevel(value: string): value is Level {
  //   return ['Easy', 'Intermediate', 'Difficult'].includes(value);
  // }

  public findRoutes(start: string, end: string, level: string[]) {
    try {
      // if (!this.isLevel(level[])) {
      //   throw new Error('Invalid level');
      // }
      const results = this.graph.findAllRoutes(start, end, level as Level[]);
      if (results.routes.length === 0) {
        return {
          message:
            'No path found with given conditions, Please select another level and check. Or Change starting or Ending Point.',
          unique_categories: [],
          routes: [],
        };
      }
      return results;
    } catch (error) {
      console.error('Error finding routes', error);
      return {
        message:
          'An error occurred while finding routes. Please try again later.',
        unique_categories: [],
        routes: [],
      };
    }
  }

  private initializeSampleGraph(): void {
    // Define slopes
    const slopes: Edge[] = [
      // Populate with slope details from the image provided
      new Edge('11 Kornock Schuss', 'X', 'T', 0, 400, 'Intermediate'),
      new Edge('1 Kornockabfahrt', 'X', 'R', 0, 2350, 'Easy'),
      new Edge('2 Hirschkogelabfahrt', 'T', 'R1', 0, 800, 'Intermediate'),
      new Edge('3 Pauliabfahrt', 'T', 'R', 0, 1300, 'Intermediate'),
      new Edge('4 MAPAKI Familienabfahrt', 'T', 'R', 0, 1100, 'Intermediate'),
      new Edge('5 Engländerabfahrt', 'Y', 'P', 0, 300, 'Intermediate'),
      new Edge(
        '6 Übungswiesenabfahrt links',
        'P1',
        'Y',
        0,
        400,
        'Intermediate',
      ),
      new Edge('7 Übungswiesenabfahrt rechts', 'P2', 'Y', 0, 500, 'Easy'),
      new Edge('8 Alibi - für Panoramabahn', 'D1', 'B2', 0, 400, 'Easy'),
      new Edge('9 Abfahrt Hüttenexpress', 'A1', 'A2', 0, 400, 'Intermediate'),
      new Edge(
        '10 Kornock Steilhang - Skiroute',
        'Ski Route',
        'Ski Route',
        0,
        500,
        'Intermediate',
      ),
      new Edge('12 Panoramaabfahrt', 'C', 'A1', 0, 950, 'Intermediate'),
      new Edge('13 Ländereckabfahrt', 'P1', 'D1', 0, 400, 'Intermediate'),
      new Edge('14 Schafalmabfahrt', 'X', 'U20', 0, 1350, 'Intermediate'),
      new Edge('15 Schafnase', 'W', 'V', 0, 600, 'Difficult'),
      new Edge('16 Schafkopfabfahrt', 'T', 'V', 0, 400, 'Intermediate'),
      new Edge('17 Lampelabfahrt', 'T', 'U', 0, 400, 'Easy'),
      new Edge('18 Märchenwaldabfahrt', 'P', 'M', 0, 1900, 'Easy'),
      new Edge('19 Zirbenwaldabfahrt', 'P', 'M', 0, 1200, 'Intermediate'),
      new Edge('20 FIS - Abfahrt', 'C', 'D', 0, 2150, 'Intermediate'),
      new Edge('21 Eisenhutabfahrt', 'C', 'D', 0, 1550, 'Intermediate'),
      new Edge('22 Seitensprung', 'K', 'F', 0, 800, 'Intermediate'),
      new Edge('23 Schwarzseeabfahrt', 'B', 'A', 0, 1450, 'Intermediate'),
      new Edge('24 Weitentalabfahrt', 'B', 'A', 0, 1400, 'Intermediate'),
      new Edge('25 Abfahrt Sonnenbahn', 'F', 'G', 0, 830, 'Intermediate'),
      new Edge('26 Wildkopfabfahrt', 'Q', 'P', 0, 700, 'Easy'),
      new Edge('27 Skiweg zum Wildkopflift', 'P', 'O', 0, 1000, 'Easy'),
      new Edge('28 Skiweg zur Zirbenwaldbahn', 'P', 'S', 0, 300, 'Easy'),
      new Edge('31 Skiweg zur Turrachbahn', 'A', 'C', 0, 2000, 'Easy'),
      new Edge('32 Skiweg zur Sonnenbahn', 'G', 'C', 0, 1250, 'Easy'),
      new Edge('33 Ski - Rodelweg', 'F', 'G', 0, 880, 'Easy'),
      new Edge(
        '34 Adrenalin - Skiroute',
        'Ski Route',
        'Ski Route',
        0,
        400,
        'Intermediate',
      ),
      new Edge('36 Alibi für Seitensprung', 'J', 'F', 0, 650, 'Easy'),
      new Edge('37 – Alibi für FIS-Abfahrt', 'H', 'F', 0, 400, 'Easy'),
    ];

    // Define lifts
    const lifts: Edge[] = [
      // Populate with lift details from the image provided
      new Edge('Kornockbahn', 'X', 'R', 7, 2100, 'Easy', '6-chair lift'),
      new Edge('Kornockbahn', 'R', 'X', 7, 2100, 'Easy', '6-chair lift'),
      new Edge('Engländerlift', 'P', 'Y', 5, 916, 'Easy', 'T-bar'),
      new Edge('Engländerlift', 'Y', 'P', 5, 916, 'Easy', 'T-bar'),
      new Edge('Hüttenexpress', 'A1', 'A2', 5, 916, 'Easy', 'T-bar'),
      new Edge('Hüttenexpress', 'A2', 'A1', 5, 916, 'Easy', 'T-bar'),
      new Edge('Seitensprunglift', 'J', 'F', 5, 916, 'Easy', 'T-bar'),
      new Edge('Seitensprunglift', 'F', 'J', 5, 916, 'Easy', 'T-bar'),
      new Edge('Maulwurf', 'P', 'R', 5, 916, 'Easy', 'T-bar'),
      new Edge('Maulwurf', 'R', 'P', 5, 916, 'Easy', 'T-bar'),
      new Edge('Ottifantenlift', 'P1', 'P7', 5, 916, 'Easy', 'T-bar'),
      new Edge('Ottifantenlift', 'P7', 'P1', 5, 916, 'Easy', 'T-bar'),
      new Edge('Hirschkogellift', 'W1', 'T', 5, 916, 'Easy', 'T-bar'),
      new Edge('Hirschkogellift', 'T', 'W1', 5, 916, 'Easy', 'T-bar'),
      new Edge('Turrachbahn', 'D', 'C', 7, 2100, 'Easy', '6-chair lift'),
      new Edge('Turrachbahn', 'C', 'D', 7, 2100, 'Easy', '6-chair lift'),
      new Edge('Zirbenwaldbahn', 'N', 'M', 7, 2100, 'Easy', '6-chair lift'),
      new Edge('Zirbenwaldbahn', 'M', 'N', 7, 2100, 'Easy', '6-chair lift'),
      new Edge('Sonnenbahn', 'F', 'G', 7, 2100, 'Easy', '2-chair lift'),
      new Edge('Sonnenbahn', 'G', 'F', 7, 2100, 'Easy', '2-chair lift'),
      new Edge(
        'Panoramabahn',
        'C',
        'A1',
        10,
        3834,
        'Easy',
        'Chair lift/cable car',
      ),
      new Edge(
        'Panoramabahn',
        'A1',
        'C',
        10,
        3834,
        'Easy',
        'Chair lift/cable car',
      ),
      new Edge('Schafalmbahn', 'X', 'U', 7, 2100, 'Easy', '6-chair lift'),
      new Edge('Schafalmbahn', 'U', 'X', 7, 2100, 'Easy', '6-chair lift'),
      new Edge('Weitentallift', 'A', 'B', 5, 916, 'Easy', 'T-bar'),
      new Edge('Weitentallift', 'B', 'A', 5, 916, 'Easy', 'T-bar'),
      new Edge('Übungswiesenlift', 'F', 'Y', 5, 916, 'Easy', 'T-bar'),
      new Edge('Übungswiesenlift', 'Y', 'F', 5, 916, 'Easy', 'T-bar'),
      new Edge('Wildkopfbahn', 'Q', 'P', 7, 2100, 'Easy', '6-chair lift'),
      new Edge('Wildkopfbahn', 'P', 'Q', 7, 2100, 'Easy', '6-chair lift'),
      new Edge('Nocky-Blitz', 'C', 'E2', 10, 2833, 'Easy', 'Rack railway'),
      new Edge('Nocky-Blitz', 'E2', 'C', 10, 2833, 'Easy', 'Rack railway'),
    ];

    // Add edges & lifts to the graph for slopes
    slopes.forEach((slope) => this.graph.addEdge(slope));
    lifts.forEach((lift) => this.graph.addEdge(lift));
  }

  // Method to get all routes/edges
  public getAllRoutes(): Edge[] {
    return this.graph.getAllEdges();
  }

  //for getting the all routes
  public getAllRoutesOverview(): {
    nodes: string[];
    levels: Level[];
    edges: Edge[];
  } {
    return this.graph.getAllEdgesWithOverview();
  }
}
