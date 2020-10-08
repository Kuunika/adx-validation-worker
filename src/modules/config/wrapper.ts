export class Wrapper {
    static get<T>(key: string): T {
        const val = process.env[key] as unknown;
        return val as T;
    }
}