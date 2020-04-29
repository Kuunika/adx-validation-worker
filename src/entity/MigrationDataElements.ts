import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

@Entity()
export class MigrationDataElements {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    migrationId!: number;

    @Column()
    facilityId!: number;

    @Column()
    value!: number;

    @Column()
    dataElementCode!: string;

    @Column()
    organizationUnitCode!: string;

    @Column()
    isProcessed!: boolean;

    @Column()
    migratedAt!: string;

    @Column()
    reportingPeriod!: string;

    @CreateDateColumn()
    createdAt!: string;
}