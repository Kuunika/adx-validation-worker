import { describe } from "mocha";
import { MySQL } from "../../../src/datasource/mysql";
import { expect } from "chai";
import { Connection } from "typeorm";

describe("#Datasource MySQL", () => {
    it("~is able to connect to the database", async () => {
        const connection = await MySQL.getConnection();
        expect(connection).to.be.instanceOf(Connection);
        await connection.close();
    });
});