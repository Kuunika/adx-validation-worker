import { Repository } from "typeorm";
import { Migration } from "../entity/Migration";

export class MigrationService {
    private repo: Repository<Migration>;

    constructor(repo: Repository<Migration>) {
        this.repo = repo;
    }

    create(args: Migration): Promise<Migration> {
        const entity = this.repo.create(args);
        return this.repo.save(entity);
    }

    async update(id: number, data: Partial<Migration>): Promise<Migration> {
        let record = await this.repo.findOne(id);
        record = Object.assign({}, record, data);
        return this.repo.save(record);
    }
}