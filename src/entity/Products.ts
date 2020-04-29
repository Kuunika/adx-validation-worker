import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Products {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({ length: 255 })
    productCode!: string;

    @Column({ length: 255 })
    dataElementCode!: string;

    @Column({ length: 255 })
    openLMISCode!: string;
    
    @Column({ length: 255 })
    dhamisCode!: string;

    @CreateDateColumn()
    createdAt!: string;

    @UpdateDateColumn()
    updatedAt!: string;
}