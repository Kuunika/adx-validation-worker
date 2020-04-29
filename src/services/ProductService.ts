import { Repository } from "typeorm";
import { Products } from "../entity/Products";

export class ProductService {
    private repo: Repository<Products>;
    
    constructor(repo: Repository<Products>) {
        this.repo = repo;
    }

    create(args: Products): Promise<Products> {
        const entity = this.repo.create(args);
        return this.repo.save(entity);
    }

    getClientProduct(args: { name: string, code: string }): Promise<Products> {
        const where: {} = this.clientCodeMap(args);
        return this.repo.findOne(where) as Promise<Products>;
    }

    private clientCodeMap(args: { name: string, code: string }): {} {
        switch(args.name) {
            case 'openlmis':
                return { openLMISCode: args.code };
            case 'dhamis':
                return { dhamisCode: args.code };
            default:
                return { productCode: args.code };
        }
    }
}