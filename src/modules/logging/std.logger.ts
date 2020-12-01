export class StdLogger {
    constructor(private readonly namespace: string) {}

    log(message: string): void {
        console.log(`[${this.namespace}]: ${message}`);
    }

    error(message: string): void {
        console.error(`[${this.namespace}]: ${message}`);
    }

    debug(message: string): void {
        console.debug(`[${this.namespace}]: ${message}`);
    }
}