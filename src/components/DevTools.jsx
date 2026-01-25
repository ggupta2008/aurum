import React, { useState } from 'react';
import { Database, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import { performFullMigration, resetAllData, cleanupOrphanedData } from '../utils/dataMigration';
import { getAllClients } from '../utils/clientManager';

const DevTools = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [lastMigration, setLastMigration] = useState(null);

    const handleMigration = () => {
        const result = performFullMigration();
        setLastMigration(result);
        alert(`Migration complete!\n\nClients migrated: ${result.migration.migrated}/${result.migration.total}\nOrphaned keys removed: ${result.cleanup.removed}`);
    };

    const handleCleanup = () => {
        const result = cleanupOrphanedData();
        alert(`Cleanup complete!\n\nRemoved ${result.removed} orphaned keys`);
    };

    const handleReset = () => {
        resetAllData();
    };

    const clients = getAllClients();

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'hsla(var(--gold-primary) / 0.2)',
                    border: '1px solid hsla(var(--gold-primary) / 0.3)',
                    color: 'hsl(var(--gold-primary))',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}
                title="Developer Tools"
            >
                <Database size={18} />
            </button>
        );
    }

    return (
        <div
            className="glass-panel"
            style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                width: '400px',
                maxHeight: '600px',
                overflowY: 'auto',
                zIndex: 1000,
                padding: 'var(--space-5)',
                background: 'hsl(var(--bg-void))',
                border: '1px solid hsla(var(--gold-primary) / 0.3)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Database size={18} className="text-gold" />
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(var(--gold-primary))' }}>Developer Tools</h3>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'hsl(var(--text-dim))',
                        cursor: 'pointer',
                        fontSize: '1.2rem'
                    }}
                >
                    ×
                </button>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', marginBottom: 'var(--space-4)' }}>
                <strong>Storage Status:</strong>
                <div style={{ marginTop: 'var(--space-2)', padding: 'var(--space-3)', background: 'hsla(var(--bg-surface) / 0.3)', borderRadius: 'var(--radius-md)' }}>
                    <div>Total Clients: {clients.length}</div>
                    <div style={{ marginTop: '4px', fontSize: '0.7rem', color: 'hsl(var(--text-dim))' }}>
                        {clients.map(c => c.name).join(', ') || 'None'}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <button
                    onClick={handleMigration}
                    className="btn-ghost"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        justifyContent: 'center',
                        width: '100%',
                        padding: 'var(--space-3)',
                        fontSize: '0.75rem'
                    }}
                >
                    <RefreshCw size={14} />
                    Run Full Migration
                </button>

                <button
                    onClick={handleCleanup}
                    className="btn-ghost"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        justifyContent: 'center',
                        width: '100%',
                        padding: 'var(--space-3)',
                        fontSize: '0.75rem'
                    }}
                >
                    <Trash2 size={14} />
                    Clean Orphaned Data
                </button>

                <button
                    onClick={handleReset}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        justifyContent: 'center',
                        width: '100%',
                        padding: 'var(--space-3)',
                        fontSize: '0.75rem',
                        background: 'hsla(var(--danger) / 0.1)',
                        border: '1px solid hsla(var(--danger) / 0.3)',
                        color: 'hsl(var(--danger))',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer'
                    }}
                >
                    <AlertTriangle size={14} />
                    Reset All Data
                </button>
            </div>

            {lastMigration && (
                <div style={{
                    marginTop: 'var(--space-4)',
                    padding: 'var(--space-3)',
                    background: 'hsla(var(--success) / 0.1)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid hsla(var(--success) / 0.2)',
                    fontSize: '0.7rem',
                    color: 'hsl(var(--text-secondary))'
                }}>
                    <strong style={{ color: 'hsl(var(--success))' }}>Last Migration:</strong>
                    <div style={{ marginTop: '4px' }}>
                        Migrated: {lastMigration.migration.migrated}/{lastMigration.migration.total}
                    </div>
                    <div>Cleaned: {lastMigration.cleanup.removed} keys</div>
                </div>
            )}

            <div style={{
                marginTop: 'var(--space-4)',
                padding: 'var(--space-3)',
                background: 'hsla(var(--warning) / 0.05)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid hsla(var(--warning) / 0.2)',
                fontSize: '0.65rem',
                color: 'hsl(var(--text-dim))',
                lineHeight: 1.4
            }}>
                <strong style={{ color: 'hsl(var(--warning))' }}>⚠️ Developer Only</strong>
                <div style={{ marginTop: '4px' }}>
                    These tools modify localStorage directly. Migration runs automatically on app load.
                    Use "Reset All Data" only if you need to start fresh.
                </div>
            </div>
        </div>
    );
};

export default DevTools;
