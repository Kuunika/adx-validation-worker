import { expect } from "chai";
import { getProductCode } from "../../../src/modules/products/helpers";
import { Product } from "../../../src/modules/products/product.interface";

const fake: Product = {
  productCode: 'XX99',
  productName: 'XX',
  mappings: [
    {
      systemName: 'OpenLMIS',
      systemProductCode: 'MMH211',
      productName: 'ADXW22'
    }
  ],
  dateCreated: new Date().toISOString(),
  lastUpdated: new Date().toISOString()
}

const fakeWithoutMappings: Product = {
  productCode: 'XX99',
  productName: 'XX',
  mappings: [],
  dateCreated: new Date().toISOString(),
  lastUpdated: new Date().toISOString()
}

describe("#Product code fetch", () => {
  it('should get the product code when the client is not a special case', () => {
    const code = getProductCode(fake, 'Daniel');
    expect(code).to.equal(fake.productCode);
  });

  it('should return the client\'s code if the client is a special case', () => {
    const code = getProductCode(fake, 'openlmis');
    expect(code).to.equal('MMH211');
  })

  it('should return the product code if the client\'s mapping is not present', () => {
    const code = getProductCode(fake, 'dhamis');
    expect(code).to.equal(fake.productCode);
  })

  it('should return null if the product does not have code mappings', () => {
    const code = getProductCode(fakeWithoutMappings, 'Daniel');
    expect(code).to.equal(null);
  });
})