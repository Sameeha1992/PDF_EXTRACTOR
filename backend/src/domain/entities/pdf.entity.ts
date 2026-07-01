export class IPdf {
  constructor(
    public readonly originalName: string,
    public readonly filename: string,
    public readonly path: string,
    public readonly totalPages: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}
}