import Axios, { AxiosError } from 'axios';
import AxiosRetry from 'axios-retry';
import { Wrapper } from "../config/wrapper";
import { LOGGER } from '../logging/winston.logger';
import { ProductMasterClientGatewayException } from './product-master-client-gateway.exception';
import { Product } from "./product.interface";
import { getProductMasterSrc } from './helpers';

export class ProductMasterClient {
    private MAX_RETRIES = 3;

    constructor() {
        AxiosRetry(Axios, { retries: this.MAX_RETRIES });
    }

    async findProductByCode(code: string, client: string): Promise<Product|null> {
        const host = Wrapper.get<string>('AVW_PRODUCT_MASTER_URL');
        const src = getProductMasterSrc(client);
        const srcQuery = src ? `?system=${src}` : '';
        const productPath = `${host}/products/${code}${srcQuery}`;
        try {
            LOGGER.info(`Attempting to find product ${productPath}.`);
            const product = (await Axios.get(productPath)).data;
            LOGGER.info(`Found product ${productPath}`);
            return product;
        } catch(error) {
            const err = error as AxiosError;
            if (err && err.response && err.response.status === 404) {
                LOGGER.error(`Failed to find product ${productPath}. ${err.response.statusText}.`);
            }
            LOGGER.error(`Failed to find product ${productPath}. Gateway error.`);
            return null;
            // throw new ProductMasterClientGatewayException(`There was a problem talking to the Product Master when fetching ${code}.`);
        }
    }
}