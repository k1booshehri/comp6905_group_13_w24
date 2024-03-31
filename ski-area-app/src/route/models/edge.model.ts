export type Level = 'Easy' | 'Intermediate' | 'Difficult';
export type LiftType = 'T-bar' | '6-chair lift' | '2-chair lift' | 'Chair lift/cable car' | 'Rack railway';

export class Edge {
  constructor(
    public name: string,
    public start: string,
    public end: string,
    public time: number, // For slopes, this can be derived from length; for lifts, it's provided
    public distance: number,
    public level: Level,
    public type?: LiftType // Optional, only for lifts
  ) {}
}

export function isLift(edge: Edge): boolean {
  return typeof edge.type !== 'undefined';
}
