import { MigrationDataElement } from '.';
export interface ValidationResult {
  migrationDataElements: MigrationDataElement[],
  validationError: boolean
}