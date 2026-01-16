/**
 * IndexedDB wrapper for local storage of users and bot credentials
 */

const DB_NAME = 'freqtrade_ui';
const DB_VERSION = 1;

export interface User {
    id: string;
    username: string;
    passwordHash: string;
    createdAt: number;
}

export interface BotCredential {
    id: string;
    userId: string;
    name: string;
    url: string;
    username: string;
    password: string; // Encrypted
    createdAt: number;
    lastConnected?: number;
}

export interface BotConfig {
    id: string;
    userId: string;
    name: string;
    config: Record<string, unknown>;
    createdAt: number;
    updatedAt: number;
}

let db: IDBDatabase | null = null;

export async function initDB(): Promise<IDBDatabase> {
    if (db) return db;

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = (event.target as IDBOpenDBRequest).result;

            // Users store
            if (!database.objectStoreNames.contains('users')) {
                const userStore = database.createObjectStore('users', { keyPath: 'id' });
                userStore.createIndex('username', 'username', { unique: true });
            }

            // Bot credentials store
            if (!database.objectStoreNames.contains('botCredentials')) {
                const botStore = database.createObjectStore('botCredentials', { keyPath: 'id' });
                botStore.createIndex('userId', 'userId', { unique: false });
            }

            // Bot configs store
            if (!database.objectStoreNames.contains('botConfigs')) {
                const configStore = database.createObjectStore('botConfigs', { keyPath: 'id' });
                configStore.createIndex('userId', 'userId', { unique: false });
            }
        };
    });
}

// Generic CRUD operations
async function getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    const database = await initDB();
    const transaction = database.transaction(storeName, mode);
    return transaction.objectStore(storeName);
}

export async function add<T>(storeName: string, data: T): Promise<void> {
    const store = await getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
        const request = store.add(data);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function put<T>(storeName: string, data: T): Promise<void> {
    const store = await getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
        const request = store.put(data);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function get<T>(storeName: string, key: string): Promise<T | undefined> {
    const store = await getStore(storeName);
    return new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function getByIndex<T>(storeName: string, indexName: string, value: string): Promise<T | undefined> {
    const store = await getStore(storeName);
    const index = store.index(indexName);
    return new Promise((resolve, reject) => {
        const request = index.get(value);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function getAllByIndex<T>(storeName: string, indexName: string, value: string): Promise<T[]> {
    const store = await getStore(storeName);
    const index = store.index(indexName);
    return new Promise((resolve, reject) => {
        const request = index.getAll(value);
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

export async function remove(storeName: string, key: string): Promise<void> {
    const store = await getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function getAll<T>(storeName: string): Promise<T[]> {
    const store = await getStore(storeName);
    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}
