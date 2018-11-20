namespace Debug{
    export function error(msg) {
        console.error(`[Storex] Error: ${msg}`);
    }

    export function warn(msg) {
        console.warn(`[Storex] Warn: ${msg}`);
    }
}

export {Debug}