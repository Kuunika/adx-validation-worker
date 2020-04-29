import { suite } from "mocha";
import { createConnection, Repository, getConnection } from "typeorm";
import { expect } from "chai";
import { Products } from "../../../src/entity/Products";
import { ProductService } from "../../../src/services/ProductService";

suite("#Product service test", () => {
    let repo: Repository<Products>;
    let subject: ProductService;

    const product: Products = {
        productCode: 'XXXX',
        dataElementCode: 'XXXX',
        dhamisCode: 'XXXX',
        openLMISCode: 'XXXX',
        createdAt: new Date().toDateString(),
        updatedAt: new Date().toDateString()
    };

    before(async () => {
        repo = (await createConnection()).getRepository(Products);
        subject = new ProductService(repo);
    });

    after(async () => {
        await repo.query(`DELETE FROM products;`);
        await getConnection().close();
    });

    it("~should be able to create a product", async () => {
        expect((await subject.create(product)).productCode).to.equal(product.productCode);
    });

    it("~should be able to get a product", async () => {
        const created = await subject.create(product);
        const fetched = await subject.getClientProduct({ name: 'dhamis', code: product.productCode });
        expect(fetched.productCode).to.equal(created.productCode);
    });
});