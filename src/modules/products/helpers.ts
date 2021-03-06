import { RegexMods, SystemNames } from "../../common/constants";
import { Product } from "./product.interface";

export function getProductMasterSrc(client: string): string|null {
    const regex = new RegExp(client, RegexMods.CASE_INSENSITIVE);
    if (regex.test('openlmis')) return SystemNames.OPENLMIS;
    if (regex.test('dhamis')) return SystemNames.DHAMIS;
    return null;
}

export function getProductDHIS2Code(product: Product): string {
    const regex = new RegExp(SystemNames.DHIS2, RegexMods.CASE_INSENSITIVE);
    const code = product.mappings.find(val => regex.test(val.systemName));
    if (code) return code.systemProductCode;
    return '';
}

export function getProductCode(product: Product, client: string): string|null {
    if (!product.mappings.length) return null;
    const regex = new RegExp(client, RegexMods.CASE_INSENSITIVE);
    const key = product.mappings.find(m => regex.test(m.systemName));
    return key ? key.systemProductCode : product.productCode;
}