import { suite } from "mocha";
import { createConnection, Repository, getConnection } from "typeorm";
import { ClientService } from "../../../src/services/ClientService";
import { Client } from "../../../src/entity/Client";
import { expect } from "chai";

suite("#Client service test", () => {
    let repo: Repository<Client>;
    let subject: ClientService;

    before(async () => {
        repo = (await createConnection()).getRepository(Client);
        subject = new ClientService(repo);
    });

    after(async () => {
        await repo.query(`DELETE FROM client;`);
        await getConnection().close();
    });

    it("~should be able to create a client", async () => {
        const client = await subject.create({ name: "Lex Luthor" });
        expect(client.name).to.equal("Lex Luthor");
    });

    it("~should be able to get a client", async () => {
        const client = await subject.create({ name: "Nex Luthor" });
        const fetched = await subject.get({ name: client.name });
        expect(fetched.name).to.equal("Nex Luthor");
    });
});