import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Client {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({ length: 255 })
    name!: string;
}