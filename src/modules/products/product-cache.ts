import { Product } from "../products/product.interface";
import { Wrapper } from "../config/wrapper";
import Axios from "axios";
import AxiosRetry from "axios-retry";

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

export async function createCache(): Promise<ProductCache> {
  const cache: ProductCache = {};
  let products: Array<Product> = [];
  let currentPage = 1;
  let totalPages = 0;
  const path = `${Wrapper.get("AVW_PRODUCT_MASTER_URL")}/products`;

  do {
    const data: ProductMasterProducts = (await Axios.get(`${path}?page=${currentPage}`)).data;
    if (!data.products.length) break;
    products = [...products, ...data.products];
    currentPage += 1;
    if (!totalPages) totalPages = data.totalNumberOfPages;
  } while (currentPage <= totalPages);

  if (products.length) {
    products.forEach((product): void => {
      cache[product.productCode] = product;
    });
  }

  return cache;
}
