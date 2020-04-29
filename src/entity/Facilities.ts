import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Facilities {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({ length: 255 })
    facilityCode!: string;

    @Column({ length: 255 })
    dHIS2OrganizationalUnitCode!: string;

    @Column({ length: 255 })
    openLMISFacilityCode!: string;
    
    @Column({ length: 255 })
    dhamisFacilityCode!: string;

    @CreateDateColumn()
    createdAt!: string;

    @UpdateDateColumn()
    updatedAt!: string;
}