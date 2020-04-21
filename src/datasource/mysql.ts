import { Connection, createConnection } from "typeorm";

export class MySQL {
    private static connection: Connection;

    private constructor() {}

    static async getConnection(): Promise<Connection> {
        if (this.connection) return this.connection;
        this.connection = await createConnection();
        return this.connection;
    }
}