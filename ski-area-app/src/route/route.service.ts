// src/route/route.service.ts
import { Injectable } from '@nestjs/common';
import { Edge, Level, isLift } from './models/edge.model';
import { Graph } from './models/graph.model';

@Injectable()
export class RouteService {
  private graph: Graph;

  constructor() {
    this.graph = new Graph();
    this.initializeSampleGraph();
  }

  private initializeSampleGraph(): void {
    // Define slopes
    const slopes: Edge[] = [
      // Populate with slope details from the image provided
      new Edge('11 Kornock Schuss', 'X', 'T', 0, 400, 'Intermediate'),
      new Edge('1 Kornockabfahrt', 'X', 'R', 0, 2350, 'Easy'),
      new Edge('2 Hirschkogelabfahrt', 'T', 'R1', 0, 800, 'Intermediate'),
      new Edge('3 Pauliabfahrt','T',	'R', 0,	1300,	'Intermediate'),
      new Edge('4 MAPAKI Familienabfahrt',	'T', 'R', 0,	1100,	'Intermediate'),
      new Edge('5 Engländerabfahrt',	'Y',	'P', 0,	300,	'Intermediate'),
      new Edge('6 Übungswiesenabfahrt links',	'P1',	'Y', 0,	400,	'Intermediate'),
      new Edge('7 Übungswiesenabfahrt rechts',	'P2',	'Y', 0,	500, 'Easy'),
      new Edge('8 Alibi - für Panoramabahn',	'B1',	'B2', 0, 	400,	'Easy'),
      new Edge('9 Abfahrt Hüttenexpress',	'A1',	'A2', 0,	400,	'Intermediate'),
      new Edge('10 Kornock Steilhang - Skiroute',	'Ski Route',	'Ski Route', 0,	500,	'Intermediate'),
      new Edge('12 Panoramaabfahrt',	'C1',	'A1', 0,	950,	'Intermediate'),
      new Edge('13 Ländereckabfahrt',	'P1',	'D1', 0,	400,	'Intermediate'),
      new Edge('14 Schafalmabfahrt', 'X',	'U20', 0, 	1350,	'Intermediate'),
      new Edge('15 Schafnase',	'W',	'V', 0,	600,	'Difficult'),
      new Edge('16 Schafkopfabfahrt',	'T',	'V', 0,	400,	'Intermediate'),
      new Edge('17 Lampelabfahrt', 'T',	'U', 0,	400,	'Easy'),
      new Edge('18 Märchenwaldabfahrt',	'N',	'M', 0,	1900,	'Easy'),
      new Edge('19 Zirbenwaldabfahrt',	'N',	'M', 0,	1200,	'Intermediate'),
      new Edge('20 FIS - Abfahrt',	'E',	'D', 0,	2150,	'Intermediate'),
      new Edge('21 Eisenhutabfahrt',	'E',	'D', 0,	1550,	'Intermediate'),
      new Edge('22 Seitensprung',	'K',	'L', 0,	800,	'Intermediate'),
      new Edge('23 Schwarzseeabfahrt',	'B',	'A', 0,	1450,	'Intermediate'),
      new Edge('24 Weitentalabfahrt',	'B',	'A', 0,	1400,	'Intermediate'),
      new Edge('25 Abfahrt Sonnenbahn',	'F',	'G', 0,	830,	'Intermediate'),
      new Edge('26 Wildkopfabfahrt',	'Q',	'P', 0,	700,'Easy'),
      new Edge('27 Skiweg zum Wildkopflift',	'P',	'O', 0,	1000,	'Easy'),
      new Edge('28 Skiweg zur Zirbenwaldbahn',	'P',	'S', 0,	300,	'Easy'),
      new Edge('31 Skiweg zur Turrachbahn',	'A',	'C', 0,	2000,	'Easy'),
      new Edge('32 Skiweg zur Sonnenbahn',	'G',	'E', 0,	1250,	'Easy'),
      new Edge('33 Ski - Rodelweg',	'F',	'G', 0,	880,	'Easy'),
      new Edge('34 Adrenalin - Skiroute',	'Ski Route',	'Ski Route', 0,	400,	'Intermediate'),
      new Edge('36 Alibi für Seitensprung',	'J',	'L', 0,	650,	'Easy' ),
      new Edge('37 – Alibi für FIS-Abfahrt', 'H',	'I', 0,	400,	'Easy')
    ];
  
    // Define lifts
    const lifts: Edge[] = [
      // Populate with lift details from the image provided
      new Edge('Kornockbahn', 'X', 'R', 7, 0, 'Easy', '6-chair lift'),
      new Edge('Engländerlift', 'P', 'Y', 5, 0, 'Easy', 'T-bar'),
      new Edge('Hüttenexpress',	'A1',	'A2',	5,	0, 'Easy',	'T-bar'),
      new Edge('Seitensprunglift',	'J',	'L',	5,	0,'Easy',	'T-bar'),
      new Edge('Maulwurf',	'P',	'R',	5,	0,'Easy',	'T-bar'),
      new Edge('Ottifantenlift',	'P1',	'P7',	5,	0,'Easy',	'T-bar'),
      new Edge('Hirschkogellift',	'W1',	'T',	5,	0,	'Easy','T-bar'),
      new Edge('Turrachbahn',	'D',	'E',	7,	0,	'Easy','6-chair lift'),
      new Edge('Zirbenwaldbahn',	'N',	'M',	7,	0,'Easy',	'6-chair lift'),
      new Edge('Sonnenbahn',	'F',	'G',	7,	0,	'Easy','2-chair lift'),
      new Edge('Panoramabahn',	'C1',	'A1',	10,	0,'Easy','Chair lift/cable car'),
      new Edge('Schafalmbahn',	'X',	'U',	7,	0,	'Easy','6-chair lift'),
      new Edge('Weitentallift',	'A',	'B',	5,	0,'Easy',	'T-bar'),
      new Edge('Übungswiesenlift',	'P2',	'Y',	5,	0,'Easy',	'T-bar'),
      new Edge('Wildkopfbahn',	'Q',	'P',	7,	0,	'Easy','6-chair lift'),
      new Edge('Nocky-Blitz',	'E1',	'E2',	10,	0,	'Easy','Rack railway')
    ];
  
    // Add edges to the graph for slopes
    slopes.forEach(slope => this.graph.addEdge(slope));
  
    // Add edges to the graph for lifts, ensuring bidirectionality
    lifts.forEach(lift => {
      this.graph.addEdge(lift);
      // For bidirectional lifts, add an edge in the reverse direction
      if (isLift(lift)) {
        this.graph.addEdge(new Edge(lift.name, lift.end, lift.start, lift.time, lift.distance, lift.level, lift.type));
      }
    });
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
