import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Migration {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    clientId!: number;

    @Column()
    channelId!: string;

    @Column()
    totalMigratedElements!: number;

    @Column()
    totalDataElements!: number;

    @Column()
    totalFailedElements!: number;

    @Column()
    uploadedAt!: string;

    @Column()
    structureValidatedAt!: string;

    @Column()
    structureFailedValidationAt!: string;

    @Column()
    elementsAuthorizationAt!: string;

    @Column()
    elementsFailedAuthorizationAt!: string;

    @Column()
    valuesValidatedAt!: string;
    
    @Column()
    valuesFailedValidationAt!: string;

    @Column()
    migrationCompletedAt!: string;

    @CreateDateColumn()
    createdAt!: string;

    @UpdateDateColumn()
    updatedAt!: string;
}