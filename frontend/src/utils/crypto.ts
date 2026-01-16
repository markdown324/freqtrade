/**
 * Simple crypto utilities for password hashing and credential encryption
 * Note: For production, consider using more robust encryption libraries
 */

// Generate a random ID
export function generateId(): string {
    return crypto.randomUUID();
}

// Hash password using SHA-256
export async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await hashPassword(password);
    return passwordHash === hash;
}

// Simple XOR-based obfuscation for storing credentials
// Note: This is NOT secure encryption, just obfuscation for casual protection
const OBFUSCATION_KEY = 'freqtrade-ui-secret-key';

export function obfuscate(text: string): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i) ^ OBFUSCATION_KEY.charCodeAt(i % OBFUSCATION_KEY.length);
        result += String.fromCharCode(charCode);
    }
    return btoa(result);
}

export function deobfuscate(encoded: string): string {
    const text = atob(encoded);
    let result = '';
    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i) ^ OBFUSCATION_KEY.charCodeAt(i % OBFUSCATION_KEY.length);
        result += String.fromCharCode(charCode);
    }
    return result;
}
