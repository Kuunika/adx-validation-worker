export interface MigrationDataElement {
  id?: number;
  dataElementCode: string,
  organizationUnitCode: string,
  value: number,
  migrationId: number,
  productId: number,
  facilityId: number,
  reportingPeriod: string,
  isProcessed: boolean,
  migratedAt?: string
}