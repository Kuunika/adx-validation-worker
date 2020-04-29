import { suite } from "mocha";
import { createConnection, Repository, getConnection } from "typeorm";
import { expect } from "chai";
import { Facilities } from "../../../src/entity/Facilities";
import { FacilityService } from "../../../src/services/FacilityService";

suite("#Facility service test", () => {
    let repo: Repository<Facilities>;
    let subject: FacilityService;

    const facility: Facilities = {
        facilityCode: 'XXXX',
        dHIS2OrganizationalUnitCode: 'XXXX',
        dhamisFacilityCode: 'XXXX',
        openLMISFacilityCode: 'XXXX',
        createdAt: new Date().toDateString(),
        updatedAt: new Date().toDateString()
    };

    before(async () => {
        repo = (await createConnection()).getRepository(Facilities);
        subject = new FacilityService(repo);
    });

    after(async () => {
        await repo.query(`DELETE FROM facilities;`);
        await getConnection().close();
    });

    it("~should be able to create a facility", async () => {
        expect((await subject.create(facility)).facilityCode).to.equal(facility.facilityCode);
    });

    it("~should be able to get a facility", async () => {
        const created = await subject.create(facility);
        const fetched = await subject.getClientFacility({ name: 'dhamis', code: facility.dhamisFacilityCode });
        expect(fetched.facilityCode).to.equal(created.facilityCode);
    });
});