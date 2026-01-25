import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { WealthProvider, useWealth } from './WealthContext';
import * as clientManager from '../utils/clientManager';

// Mock client manager
vi.mock('../utils/clientManager', () => ({
    migrateLegacyData: vi.fn(() => ({ migrated: false })),
    getCurrentClientId: vi.fn(() => 'test-client'),
    setCurrentClientId: vi.fn(),
    getClient: vi.fn(() => ({
        family: [{ id: 1, name: 'John', age: 45, relation: 'Self', familyGroupId: 0, financials: { income: 100000, stocks: 0, retirement: 0, realEstate: 0, cash: 0, loans: 0 } }],
        financials: { taxable: 100000, taxDeferred: 200000, taxFree: 300000, income: 150000, spending: 80000, taxRate: 0.25 },
        goals: { primary: 'retirement' },
        marketRegime: 'goldilocks',
        strategies: {}
    })),
    saveClient: vi.fn(),
    getAllClients: vi.fn(() => [{ id: 'test-client', name: 'Test Client' }]),
    createNewClient: vi.fn(() => ({ clientId: 'new-client', profile: {} })),
    deleteClient: vi.fn(),
    duplicateClient: vi.fn()
}));

const TestComponent = () => {
    const { privacyMode, togglePrivacyMode, formatCurrency } = useWealth();
    return (
        <div>
            <div data-testid="privacy-status">{privacyMode ? 'ON' : 'OFF'}</div>
            <div data-testid="formatted-value">{formatCurrency(1234567)}</div>
            <button data-testid="toggle-btn" onClick={togglePrivacyMode}>Toggle</button>
        </div>
    );
};

describe('WealthContext - Privacy Mode', () => {
    it('should initialize with privacy mode OFF', () => {
        render(
            <WealthProvider>
                <TestComponent />
            </WealthProvider>
        );
        expect(screen.getByTestId('privacy-status').textContent).toBe('OFF');
        expect(screen.getByTestId('formatted-value').textContent).toBe('$1,234,567');
    });

    it('should obfuscate values when privacy mode is ON', async () => {
        render(
            <WealthProvider>
                <TestComponent />
            </WealthProvider>
        );

        const btn = screen.getByTestId('toggle-btn');
        await act(async () => {
            fireEvent.click(btn);
        });

        expect(screen.getByTestId('privacy-status').textContent).toBe('ON');
        expect(screen.getByTestId('formatted-value').textContent).toBe('••••••');
    });

    it('should restore values when privacy mode is toggled back OFF', async () => {
        render(
            <WealthProvider>
                <TestComponent />
            </WealthProvider>
        );

        const btn = screen.getByTestId('toggle-btn');

        // Toggle ON
        await act(async () => { fireEvent.click(btn); });
        expect(screen.getByTestId('formatted-value').textContent).toBe('••••••');

        // Toggle OFF
        await act(async () => { fireEvent.click(btn); });
        expect(screen.getByTestId('formatted-value').textContent).toBe('$1,234,567');
    });
});
