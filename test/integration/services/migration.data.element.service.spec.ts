import { suite } from "mocha";
import { createConnection, Repository, getConnection } from "typeorm";
import { expect } from "chai";
import { MigrationDataElements } from "../../../src/entity/MigrationDataElements";
import { MigrationDataElementService } from "../../../src/services/MigrationDataElementService";

suite("#Migration service test", () => {
    let repo: Repository<MigrationDataElements>;
    let subject: MigrationDataElementService;

    const element: MigrationDataElements = {
        migrationId: 12121,
        facilityId: 1111,
        value: 1121,
        dataElementCode: 'XASA',
        organizationUnitCode: 'XASA',
        isProcessed: false,
        reportingPeriod: 'XXASA',
        migratedAt: new Date().toDateString(),
        createdAt: new Date().toDateString()
    };

    const secondElement: MigrationDataElements = {
        migrationId: 1211,
        facilityId: 111,
        value: 112,
        dataElementCode: 'XAA',
        organizationUnitCode: 'XSA',
        isProcessed: false,
        reportingPeriod: 'XXAA',
        migratedAt: new Date().toDateString(),
        createdAt: new Date().toDateString()
    };

    before(async () => {
        repo = (await createConnection()).getRepository(MigrationDataElements);
        subject = new MigrationDataElementService(repo);
    });

    after(async () => {
        await repo.query(`DELETE FROM migration_data_elements;`);
        await getConnection().close();
    });

    it("~should be able to create a migration", async () => {
        expect((await subject.create(element)).migratedAt).to.equal(element.migratedAt);
    });

    it("should be able to bulk create migration data elements", async () => {
        expect((await subject.bulkCreate([element, secondElement])).length).to.equal(2);
    });
});