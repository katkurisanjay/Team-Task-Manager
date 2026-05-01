import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { workspaceApi } from '../api';
import { useAuth } from '../context/AuthContext';

function CreateWorkspaceModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await workspaceApi.create(form);
      onCreated(res.data.data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>New workspace</h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '3px 0 0' }}>Create a new project workspace.</p>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="label" htmlFor="ws-name-input">Name</label>
            <input id="ws-name-input" className="input" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Website Redesign" required />
          </div>
          <div>
            <label className="label">
              Description{' '}
              <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span>
            </label>
            <textarea
              id="ws-desc-input"
              className="input"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What's this workspace for?"
              style={{ resize: 'vertical' }}
            />
          </div>
          {error && (
            <div style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)', borderRadius: 6, padding: '8px 12px' }}>
              <p className="form-error">{error}</p>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button id="ws-create-submit" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function WorkspacesPage() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    workspaceApi.getAll()
      .then((res) => setWorkspaces(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const handleCreated = (ws) => setWorkspaces((prev) => [ws, ...prev]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 64 }}>
      <div className="spinner spinner-dark" style={{ width: 24, height: 24, borderWidth: 2.5 }} />
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Workspaces</h1>
          <p className="page-subtitle">Projects you're a member of</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button id="btn-new-workspace" className="btn btn-primary" onClick={() => setShowModal(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New workspace
          </button>
        )}
      </div>

      {workspaces.length === 0 ? (
        <div className="card empty-state">
          <p className="empty-title">No workspaces yet</p>
          <p className="empty-sub">
            {user?.role === 'ADMIN' ? 'Create your first workspace to get started.' : 'Ask an admin to add you to a workspace.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {workspaces.map((ws) => (
            <Link key={ws.id} to={`/workspaces/${ws.id}`} style={{ textDecoration: 'none' }}>
              <div className="card card-hover" style={{ padding: '18px 20px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 7, background: 'var(--accent-light)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ws.name}</h3>
                  </div>
                </div>
                {ws.description && (
                  <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {ws.description}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 12, fontSize: 12.5, color: 'var(--text-muted)', marginTop: ws.description ? 0 : 8 }}>
                  <span>{ws._count?.members} member{ws._count?.members !== 1 ? 's' : ''}</span>
                  <span>·</span>
                  <span>{ws._count?.tickets} ticket{ws._count?.tickets !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && <CreateWorkspaceModal onClose={() => setShowModal(false)} onCreated={handleCreated} />}
    </div>
  );
}
