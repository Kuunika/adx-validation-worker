import { Repository } from "typeorm";
import { MigrationDataElements } from "../entity/MigrationDataElements";

export class MigrationDataElementService {
    private repo: Repository<MigrationDataElements>;

    constructor(repo: Repository<MigrationDataElements>) {
        this.repo = repo;
    }

    create(args: MigrationDataElements): Promise<MigrationDataElements> {
        const entity = this.repo.create(args);
        return this.repo.save(entity);
    }

    bulkCreate(args: MigrationDataElements[]): Promise<MigrationDataElements[]> {
        return Promise.all(args.map(async (arg): Promise<MigrationDataElements> => {
            const entity = this.repo.create(arg);
            return this.repo.save(entity);
        }));
    }
}