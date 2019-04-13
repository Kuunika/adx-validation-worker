export interface ValidationFailure {
  id?: number,
  migrationId: number,
  reason: string,
  fileName: string,
  createdAt?: string
}