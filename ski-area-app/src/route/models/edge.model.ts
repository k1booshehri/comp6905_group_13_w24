export type Level = 'blue' | 'red' | 'black';

export class Edge {
  public isLift: boolean;

  constructor(
    public start: string,
    public end: string,
    public time: number,
    public distance: number,
    public level?: Level // Optional parameter
  ) {
    // If 'level' is not provided, it's a lift; otherwise, it's a slope.
    this.isLift = typeof level === 'undefined';
  }
}