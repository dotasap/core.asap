import fs from 'fs';

const FILE_PATH = './.processedDigests.json';

let cache = new Set<string>();

export function loadProcessedDigests(): void {
    try {
        const data = fs.readFileSync(FILE_PATH, 'utf-8');
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
            cache = new Set(parsed);
        }
    } catch {
        cache = new Set();
    }
}

export function isDigestProcessed(digest: string): boolean {
    return cache.has(digest);
}

export function markDigestAsProcessed(digest: string): void {
    cache.add(digest);
    saveProcessedDigests();
}

function saveProcessedDigests(): void {
    fs.writeFileSync(FILE_PATH, JSON.stringify([...cache]));
}
