export interface Product {
    productCode: string;
    productName: string;
    mappings: ProductMapping[];
    dateCreated: string;
    lastUpdated: string;
}

export interface ProductMapping {
    systemName: string;
    systemProductCode: string;
    productName: string;
}
