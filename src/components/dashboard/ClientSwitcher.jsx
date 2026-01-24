import React, { useState } from 'react';
import { useWealth } from '../../context/WealthContext';
import { Users, Plus, Trash2, Copy, Edit2, Check, X, Search } from 'lucide-react';

const ClientSwitcher = () => {
    const {
        currentClientId,
        getClientList,
        switchClient,
        createClient,
        removeClient,
        cloneClient,
        updateClientMetadata
    } = useWealth();

    const [showDropdown, setShowDropdown] = useState(false);
    const [showNewClientDialog, setShowNewClientDialog] = useState(false);
    const [newClientName, setNewClientName] = useState('');
    const [editingClientId, setEditingClientId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const clients = getClientList();
    const currentClient = clients.find(c => c.id === currentClientId);

    const filteredClients = searchQuery
        ? clients.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : clients;

    const handleCreateClient = () => {
        if (newClientName.trim()) {
            createClient(newClientName.trim());
            setNewClientName('');
            setShowNewClientDialog(false);
            setShowDropdown(false);
        }
    };

    const handleDeleteClient = (clientId, e) => {
        e.stopPropagation();
        if (clients.length === 1) {
            alert('Cannot delete the last client. Create a new client first.');
            return;
        }
        if (confirm('Are you sure you want to delete this client? This cannot be undone.')) {
            removeClient(clientId);
        }
    };

    const handleDuplicateClient = (clientId, e) => {
        e.stopPropagation();
        const client = clients.find(c => c.id === clientId);
        cloneClient(clientId, `${client.name} (Copy)`);
        setShowDropdown(false);
    };

    const handleRenameClient = (clientId, newName) => {
        if (newName.trim()) {
            updateClientMetadata(clientId, { name: newName.trim() });
            setEditingClientId(null);
            setEditingName('');
        }
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div style={{ position: 'relative' }}>
            {/* Current Client Button */}
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    background: 'hsla(var(--bg-surface) / 0.5)',
                    border: '1px solid hsla(var(--gold-primary) / 0.2)',
                    borderRadius: '12px',
                    color: 'hsl(var(--text-primary))',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minWidth: '250px',
                    backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'hsla(var(--gold-primary) / 0.4)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'hsla(var(--gold-primary) / 0.2)'}
            >
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, hsla(var(--gold-primary) / 0.2), hsla(var(--info) / 0.2))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Users size={18} style={{ color: 'hsl(var(--gold-primary))' }} />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                        {currentClient?.name || 'No Client'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>
                        {currentClient ? formatDate(currentClient.lastModified) : ''}
                    </div>
                </div>
                <div style={{
                    fontSize: '0.7rem',
                    color: 'hsl(var(--text-muted))',
                    transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                }}>
                    ▼
                </div>
            </button>

            {/* Dropdown */}
            {showDropdown && (
                <div
                    className="glass-panel"
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        left: 0,
                        right: 0,
                        maxHeight: '500px',
                        overflowY: 'auto',
                        zIndex: 1000,
                        padding: '0.75rem',
                        border: '1px solid hsla(var(--gold-primary) / 0.2)',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                    }}
                >
                    {/* Search */}
                    {clients.length > 5 && (
                        <div style={{ marginBottom: '0.75rem' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={14} style={{
                                    position: 'absolute',
                                    left: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'hsl(var(--text-muted))'
                                }} />
                                <input
                                    type="text"
                                    placeholder="Search clients..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                                        background: 'hsla(var(--bg-elevated) / 0.5)',
                                        border: '1px solid hsla(var(--text-primary) / 0.1)',
                                        borderRadius: '8px',
                                        color: 'hsl(var(--text-primary))',
                                        fontSize: '0.8rem'
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Client List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        {filteredClients.map(client => (
                            <div
                                key={client.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem',
                                    background: client.id === currentClientId
                                        ? 'hsla(var(--gold-primary) / 0.1)'
                                        : 'hsla(var(--bg-elevated) / 0.3)',
                                    border: client.id === currentClientId
                                        ? '1px solid hsla(var(--gold-primary) / 0.3)'
                                        : '1px solid hsla(var(--text-primary) / 0.05)',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onClick={() => {
                                    if (client.id !== currentClientId) {
                                        switchClient(client.id);
                                        setShowDropdown(false);
                                    }
                                }}
                                onMouseEnter={(e) => {
                                    if (client.id !== currentClientId) {
                                        e.currentTarget.style.background = 'hsla(var(--gold-primary) / 0.05)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (client.id !== currentClientId) {
                                        e.currentTarget.style.background = 'hsla(var(--bg-elevated) / 0.3)';
                                    }
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    {editingClientId === client.id ? (
                                        <input
                                            type="text"
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleRenameClient(client.id, editingName);
                                                if (e.key === 'Escape') setEditingClientId(null);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            autoFocus
                                            style={{
                                                width: '100%',
                                                padding: '0.25rem 0.5rem',
                                                background: 'hsla(var(--bg-void) / 0.5)',
                                                border: '1px solid hsla(var(--gold-primary) / 0.3)',
                                                borderRadius: '4px',
                                                color: 'hsl(var(--text-primary))',
                                                fontSize: '0.875rem'
                                            }}
                                        />
                                    ) : (
                                        <>
                                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'hsl(var(--text-primary))' }}>
                                                {client.name}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>
                                                Modified {formatDate(client.lastModified)}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    {editingClientId === client.id ? (
                                        <>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRenameClient(client.id, editingName);
                                                }}
                                                style={{
                                                    padding: '0.25rem',
                                                    background: 'hsla(var(--success) / 0.2)',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    color: 'hsl(var(--success))',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <Check size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingClientId(null);
                                                }}
                                                style={{
                                                    padding: '0.25rem',
                                                    background: 'hsla(var(--danger) / 0.2)',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    color: 'hsl(var(--danger))',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingClientId(client.id);
                                                    setEditingName(client.name);
                                                }}
                                                style={{
                                                    padding: '0.25rem',
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: 'hsl(var(--text-muted))',
                                                    cursor: 'pointer'
                                                }}
                                                title="Rename"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => handleDuplicateClient(client.id, e)}
                                                style={{
                                                    padding: '0.25rem',
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: 'hsl(var(--text-muted))',
                                                    cursor: 'pointer'
                                                }}
                                                title="Duplicate"
                                            >
                                                <Copy size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteClient(client.id, e)}
                                                style={{
                                                    padding: '0.25rem',
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: 'hsl(var(--danger))',
                                                    cursor: 'pointer'
                                                }}
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* New Client Button */}
                    {!showNewClientDialog ? (
                        <button
                            onClick={() => setShowNewClientDialog(true)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'linear-gradient(135deg, hsla(var(--gold-primary) / 0.1), hsla(var(--success) / 0.1))',
                                border: '1px dashed hsla(var(--gold-primary) / 0.3)',
                                borderRadius: '8px',
                                color: 'hsl(var(--gold-primary))',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, hsla(var(--gold-primary) / 0.2), hsla(var(--success) / 0.2))'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, hsla(var(--gold-primary) / 0.1), hsla(var(--success) / 0.1))'}
                        >
                            <Plus size={16} />
                            New Client
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                placeholder="Client name..."
                                value={newClientName}
                                onChange={(e) => setNewClientName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCreateClient();
                                    if (e.key === 'Escape') setShowNewClientDialog(false);
                                }}
                                autoFocus
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: 'hsla(var(--bg-elevated) / 0.5)',
                                    border: '1px solid hsla(var(--gold-primary) / 0.3)',
                                    borderRadius: '8px',
                                    color: 'hsl(var(--text-primary))',
                                    fontSize: '0.875rem'
                                }}
                            />
                            <button
                                onClick={handleCreateClient}
                                style={{
                                    padding: '0.75rem',
                                    background: 'hsla(var(--success) / 0.2)',
                                    border: '1px solid hsla(var(--success) / 0.3)',
                                    borderRadius: '8px',
                                    color: 'hsl(var(--success))',
                                    cursor: 'pointer'
                                }}
                            >
                                <Check size={16} />
                            </button>
                            <button
                                onClick={() => {
                                    setShowNewClientDialog(false);
                                    setNewClientName('');
                                }}
                                style={{
                                    padding: '0.75rem',
                                    background: 'hsla(var(--danger) / 0.2)',
                                    border: '1px solid hsla(var(--danger) / 0.3)',
                                    borderRadius: '8px',
                                    color: 'hsl(var(--danger))',
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    <div style={{
                        marginTop: '0.75rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid hsla(var(--text-primary) / 0.1)',
                        fontSize: '0.7rem',
                        color: 'hsl(var(--text-muted))',
                        textAlign: 'center'
                    }}>
                        {clients.length} client{clients.length !== 1 ? 's' : ''} • Auto-saved to localStorage
                    </div>
                </div>
            )}

            {/* Click outside to close */}
            {showDropdown && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 999
                    }}
                    onClick={() => setShowDropdown(false)}
                />
            )}
        </div>
    );
};

export default ClientSwitcher;
