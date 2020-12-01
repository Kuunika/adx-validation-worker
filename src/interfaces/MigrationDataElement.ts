export interface MigrationDataElement {
  id?: number;
  dataElementCode: string;
  organizationUnitCode: string;
  value: number;
  migrationId: number;
  facilityId: string;
  reportingPeriod: string;
  isProcessed: boolean;
  migratedAt?: string;
}