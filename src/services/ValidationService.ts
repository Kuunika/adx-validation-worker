import { Repository } from "typeorm";
import { Validationfailures } from "../entity/Validationfailures";

export class ValidationService {
    private repo: Repository<Validationfailures>;

    constructor(repo: Repository<Validationfailures>) {
        this.repo = repo;
    }

    create(args: Validationfailures): Promise<Validationfailures> {
        const entity = this.repo.create(args);
        return this.repo.save(entity);
    }

    bulkCreate(args: Validationfailures[]): Promise<Validationfailures[]> {
        return Promise.all(args.map(async (arg): Promise<Validationfailures> => {
            const entity = this.repo.create(arg);
            return this.repo.save(entity);
        }));
    }
}