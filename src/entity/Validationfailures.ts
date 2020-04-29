import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Validationfailures {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    migrationId!: number;

    @Column()
    reason!: string;

    @Column()
    filename!: string;

    @CreateDateColumn()
    createdAt!: string;
}