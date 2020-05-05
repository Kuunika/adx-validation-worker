export class Wrapper {
    private static base: NodeJS.ProcessEnv = process.env;
    
    static get(key: string): string|null {
        return this.base[key] || null;
    }

    static set(key: string, value: string): void {
        this.base[key] = value;
    }

    static delete(key: string): void {
        delete this.base[key];
    }
}