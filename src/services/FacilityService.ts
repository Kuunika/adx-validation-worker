import { Repository } from "typeorm";
import { Facilities } from "../entity/Facilities";

export class FacilityService {
    private repo: Repository<Facilities>;

    constructor(repo: Repository<Facilities>) {
        this.repo = repo;
    }

    create(args: Facilities): Promise<Facilities> {
        const entity = this.repo.create(args);
        return this.repo.save(entity);
    }

    getClientFacility(args: { name: string, code: string }): Promise<Facilities> {
        const where: {} = this.clientCodeMap(args);
        return this.repo.findOne(where) as Promise<Facilities>;
    }

    private clientCodeMap(args: { name: string, code: string }): {} {
        switch(args.name) {
            case 'openlmis':
                return { openLMISFacilityCode: args.code };
            case 'dhamis':
                return { dhamisFacilityCode: args.code };
            default:
                return { facilityCode: args.code };
        }
    }
}