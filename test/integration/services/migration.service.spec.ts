import { suite } from "mocha";
import { createConnection, Repository, getConnection } from "typeorm";
import { expect } from "chai";
import { Migration } from "../../../src/entity/Migration";
import { MigrationService } from "../../../src/services/MIgrationService";

suite("#Migration service test", () => {
    let repo: Repository<Migration>;
    let subject: MigrationService;

    const migration: Migration = {
        clientId: 1121,
        channelId: 'XXXX',
        totalDataElements: 3,
        totalFailedElements: 1,
        totalMigratedElements: 2,
        structureValidatedAt: new Date().toDateString(),
        structureFailedValidationAt: new Date().toDateString(),
        elementsAuthorizationAt: new Date().toDateString(),
        elementsFailedAuthorizationAt: new Date().toDateString(),
        valuesFailedValidationAt: new Date().toDateString(),
        valuesValidatedAt: new Date().toDateString(),
        migrationCompletedAt: new Date().toDateString(),
        uploadedAt: new Date().toDateString(),
        createdAt: new Date().toDateString(),
        updatedAt: new Date().toDateString()
    };

    before(async () => {
        repo = (await createConnection()).getRepository(Migration);
        subject = new MigrationService(repo);
    });

    after(async () => {
        await repo.query(`DELETE FROM migration;`);
        await getConnection().close();
    });

    it("~should be able to create a migration", async () => {
        expect((await subject.create(migration)).channelId).to.equal(migration.channelId);
    });

    it("~should be able to update a migration", async () => {
        const created = await subject.create(migration);
        const time = new Date().toDateString();
        const updated = await subject.update(created.id as number, { updatedAt: time });
        expect(time).to.equal(updated.updatedAt);
    })
});