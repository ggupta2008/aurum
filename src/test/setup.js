// Test setup file
import '@testing-library/jest-dom';
import { beforeEach } from 'vitest';

// Real in-memory localStorage implementation for tests
class LocalStorageMock {
    constructor() {
        this.store = {};
    }

    get length() {
        return Object.keys(this.store).length;
    }

    key(i) {
        const keys = Object.keys(this.store);
        return keys[i] || null;
    }

    clear() {
        this.store = {};
    }

    getItem(key) {
        return this.store[key] || null;
    }

    setItem(key, value) {
        this.store[key] = String(value);
    }

    removeItem(key) {
        delete this.store[key];
    }
}

globalThis.localStorage = new LocalStorageMock();

// Clear localStorage before each test
beforeEach(() => {
    globalThis.localStorage.clear();
});
