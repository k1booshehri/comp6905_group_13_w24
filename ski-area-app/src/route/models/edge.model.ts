export type Level = 'Easy' | 'Intermediate' | 'Difficult';
export type LiftType = any;

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

export function isLift(edge: Edge | undefined): boolean {
  return !!edge && typeof edge.type !== 'undefined';
}
