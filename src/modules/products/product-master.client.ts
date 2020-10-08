import Axios, { AxiosError } from 'axios';
import { Wrapper } from "../config/wrapper";
import { StdLogger } from "../logging/std.logger";
import { ProductMasterClientGatewayException } from './product-master-client-gateway.exception';
import { Product } from "./product.interface";
import { getProductMasterSrc } from './helpers';

export class ProductMasterClient {
    private logger: StdLogger = new StdLogger('Product Master Client');

    async findProductByCode(code: string, client: string): Promise<Product|null> {
        const host = Wrapper.get<string>('AVW_PRODUCT_MASTER_URL');
        const src = getProductMasterSrc(client);
        const srcQuery = src ? `?system=${src}` : '';
        const productPath = `${host}/products/${code}${srcQuery}`;
        try {
            this.logger.debug(`Attempting to find product ${productPath}.`);
            const product = (await Axios.get(productPath)).data;
            this.logger.debug(`Found product ${productPath}`);
            return product;
        } catch(error) {
            const err = error as AxiosError;
            if (err && err.response && err.response.status === 404) {
                this.logger.error(`Failed to find product ${productPath}. ${err.response.statusText}.`);
            }
            this.logger.error(`Failed to find product ${productPath}. Gateway error.`);
            return null;
            // throw new ProductMasterClientGatewayException(`There was a problem talking to the Product Master when fetching ${code}.`);
        }
    }
}