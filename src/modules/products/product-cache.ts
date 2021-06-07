import { Product } from "../products/product.interface";
import { Wrapper } from "../config/wrapper";
import Axios from "axios";
import AxiosRetry from "axios-retry";
import { getProductCode } from "./helpers";
import { LOGGER } from "../logging/winston.logger";

type ProductCache = {
  [k in keyof any]: Product;
};

type ProductMasterProducts = {
  page: number;
  totalNumberOfPages: number;
  totalNumberOfProducts: number;
  products: Array<Product>;
}

const MAX_RETRIES = 3;
AxiosRetry(Axios, { retries: MAX_RETRIES });

export async function createCache(client: string): Promise<ProductCache> {
  const cache: ProductCache = {};
  let products: Array<Product> = [];
  let currentPage = 1;
  let totalPages = 0;
  const path = `${Wrapper.get("AVW_PRODUCT_MASTER_URL")}/products`;

  LOGGER.info('Products Cache: Fetching products...');
  do {
    const data: ProductMasterProducts = (await Axios.get(`${path}?page=${currentPage}`)).data;
    if (!data.products.length) break;
    products = [...products, ...data.products];
    currentPage += 1;
    if (!totalPages) totalPages = data.totalNumberOfPages;
  } while (currentPage <= totalPages);
  LOGGER.info('Products Cache: Products fetched.');

  if (products.length) {
    LOGGER.info('Products Cache: Caching products...');
    products.forEach((product): void => {
      const key = getProductCode(product, client);
      if (key) cache[key] = product;
    });
    LOGGER.info('Products Cache: Products cached.');
  }

  return cache;
}
