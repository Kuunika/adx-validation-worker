import { Client } from "../entity/Client";
import { Repository } from "typeorm";

export class ClientService {
    private repo: Repository<Client>;

    constructor(repository: Repository<Client>) {
        this.repo = repository;
    }

    create(client: Client): Promise<Client> {
        const entity = this.repo.create(client);
        return this.repo.save(entity);
    }

    get(filters: {}): Promise<Client> {
        return this.repo.findOne(filters) as Promise<Client>; 
    }
}