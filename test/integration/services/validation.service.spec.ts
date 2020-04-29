import { suite } from "mocha";
import { createConnection, Repository, getConnection } from "typeorm";
import { expect } from "chai";
import { Validationfailures } from "../../../src/entity/Validationfailures";
import { ValidationService } from "../../../src/services/ValidationService";

suite("#Validation service test", () => {
    let repo: Repository<Validationfailures>;
    let subject: ValidationService;

    const element: Validationfailures = {
        migrationId: 12121,
        reason: 'XXXX',
        filename: 'XXXX',
        createdAt: new Date().toDateString()
    };

    const secondElement: Validationfailures = {
        migrationId: 12121,
        reason: 'XXXX',
        filename: 'XXXX',
        createdAt: new Date().toDateString()
    };

    before(async () => {
        repo = (await createConnection()).getRepository(Validationfailures);
        subject = new ValidationService(repo);
    });

    after(async () => {
        await repo.query(`DELETE FROM validationfailures;`);
        await getConnection().close();
    });

    it("~should be able to create a validation failure", async () => {
        expect((await subject.create(element)).migrationId).to.equal(element.migrationId);
    });

    it("~should be able to create failures in bulk", async () => {
        const response = await subject.bulkCreate([element, secondElement]);
        expect(response.length).to.equal(2);
    });
});