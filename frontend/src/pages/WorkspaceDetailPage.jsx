import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workspaceApi, ticketApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { format, isPast } from 'date-fns';

function StatusBadge({ status, isOverdue }) {
  if (isOverdue) return <span className="badge badge-overdue">Overdue</span>;
  const cls = { TODO: 'badge-todo', IN_PROGRESS: 'badge-inprogress', DONE: 'badge-done' }[status] || 'badge-todo';
  const label = { TODO: 'Todo', IN_PROGRESS: 'In Progress', DONE: 'Done' }[status] || status;
  return <span className={`badge ${cls}`}>{label}</span>;
}

function TicketFormModal({ title, ticket, members, isAdmin, onClose, onSubmit }) {
  const { workspaceId } = useParams();
  const isEdit = !!ticket;
  const [form, setForm] = useState({
    title: ticket?.title || '',
    description: ticket?.description || '',
    status: ticket?.status || 'TODO',
    due_date: ticket?.due_date ? format(new Date(ticket.due_date), 'yyyy-MM-dd') : '',
    assignee_id: ticket?.assignee_id || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const payload = {
      ...form,
      due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
      assignee_id: form.assignee_id || null,
    };
    try {
      const res = isEdit
        ? await ticketApi.update(workspaceId, ticket.id, payload)
        : await ticketApi.create(workspaceId, payload);
      onSubmit(res.data.data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{title}</h2>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="label">Title</label>
            <input
              id="ticket-title-input"
              className="input"
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="What needs to happen?"
              required
              disabled={isEdit && !isAdmin}
            />
          </div>
          {isAdmin && (
            <div>
              <label className="label">Description <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></label>
              <textarea
                id="ticket-desc-input"
                className="input"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Any extra context..."
                style={{ resize: 'vertical' }}
              />
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1fr 1fr' : '1fr', gap: 12 }}>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={{ cursor: 'pointer' }}>
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
            {isAdmin && (
              <div>
                <label className="label">Due date</label>
                <input id="ticket-due-input" className="input" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
              </div>
            )}
          </div>
          {isAdmin && (
            <div>
              <label className="label">Assignee</label>
              <select id="ticket-assignee-input" className="input" value={form.assignee_id} onChange={(e) => setForm({ ...form, assignee_id: e.target.value })} style={{ cursor: 'pointer' }}>
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user_id} value={m.user_id}>{m.user.name}</option>
                ))}
              </select>
            </div>
          )}
          {error && (
            <div style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)', borderRadius: 6, padding: '9px 12px' }}>
              <p className="form-error">{error}</p>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button id={isEdit ? 'ticket-update-submit' : 'ticket-create-submit'} type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : (isEdit ? 'Save changes' : 'Create ticket')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddMemberModal({ workspaceId, onClose, onAdded }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await workspaceApi.addMember(workspaceId, { email });
      onAdded();
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
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Add member</h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>Enter the email of an existing user.</p>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="label" htmlFor="add-member-email">Email address</label>
            <input id="add-member-email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="bob@example.com" required />
          </div>
          {error && (
            <div style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)', borderRadius: 6, padding: '9px 12px' }}>
              <p className="form-error">{error}</p>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button id="add-member-submit" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Add member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function WorkspaceDetailPage() {
  const { workspaceId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';

  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tickets');
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = () => {
    setLoading(true);
    workspaceApi.getById(workspaceId)
      .then((res) => setWorkspace(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [workspaceId]);

  const handleDeleteWorkspace = async () => {
    try {
      await workspaceApi.delete(workspaceId);
      navigate('/workspaces');
    } catch (err) { alert(err.message); }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await workspaceApi.removeMember(workspaceId, userId);
      load();
    } catch (err) { alert(err.message); }
  };

  const handleTicketCreated = (ticket) =>
    setWorkspace((prev) => ({ ...prev, tickets: [ticket, ...prev.tickets] }));

  const handleTicketUpdated = (updated) =>
    setWorkspace((prev) => ({
      ...prev, tickets: prev.tickets.map((t) => (t.id === updated.id ? updated : t))
    }));

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <div className="spinner spinner-dark" style={{ width: 26, height: 26, borderWidth: 2.5 }} />
    </div>
  );

  if (!workspace) return <p style={{ color: 'var(--text-secondary)' }}>Workspace not found.</p>;

  const tickets = workspace.tickets || [];
  const members = workspace.members || [];
  const total = tickets.length;
  const done = tickets.filter((t) => t.status === 'DONE').length;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);
  const now = new Date();

  return (
    <div>
      {/* Back */}
      <button onClick={() => navigate('/workspaces')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', padding: '0 0 16px', display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'inherit' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Workspaces
      </button>

      {/* Header */}
      <div className="page-header" style={{ alignItems: 'flex-start', marginBottom: 20 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="page-title">{workspace.name}</h1>
          {workspace.description && (
            <p className="page-subtitle" style={{ marginTop: 3 }}>{workspace.description}</p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
            <div className="progress-bar" style={{ width: 180 }}>
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span style={{ fontSize: 12.5, color: 'var(--text-muted)', flexShrink: 0 }}>
              {done}/{total} done · {progress}%
            </span>
          </div>
        </div>
        {isAdmin && (
          <button id="btn-delete-workspace" className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(true)}>
            Delete workspace
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        {[
          { key: 'tickets', label: `Tickets`, count: total },
          { key: 'members', label: `Members`, count: members.length }
        ].map((t) => (
          <button
            key={t.key}
            id={`tab-${t.key}`}
            className={`tab ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
            <span style={{ marginLeft: 5, padding: '1px 6px', borderRadius: 10, fontSize: 11, background: activeTab === t.key ? 'var(--accent-light)' : 'var(--bg-secondary)', color: activeTab === t.key ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 600 }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tickets tab */}
      {activeTab === 'tickets' && (
        <div>
          {isAdmin && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
              <button id="btn-new-ticket" className="btn btn-primary" onClick={() => setShowTicketModal(true)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                New ticket
              </button>
            </div>
          )}

          {tickets.length === 0 ? (
            <div className="card empty-state">
              <p className="empty-title">No tickets yet</p>
              {isAdmin && <p className="empty-sub">Create the first ticket to get started.</p>}
            </div>
          ) : (
            <div className="card" style={{ overflow: 'hidden' }}>
              {tickets.map((ticket) => {
                const isOverdue = ticket.due_date && ticket.status !== 'DONE' && isPast(new Date(ticket.due_date));
                const canEdit = isAdmin || ticket.assignee_id === user.id;
                return (
                  // KEY FIX: single flex row, content on left, controls pinned to right
                  <div
                    key={ticket.id}
                    className="table-row"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
                  >
                    {/* Left: ticket info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ticket.title}
                      </p>
                      <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                        {ticket.assignee ? ticket.assignee.name : 'Unassigned'}
                        {ticket.due_date && (
                          <span style={{ color: isOverdue ? 'var(--error)' : 'var(--text-muted)' }}>
                            {' · '} Due {format(new Date(ticket.due_date), 'MMM d')}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Right: badge + edit button — always on the same line */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <StatusBadge status={ticket.status} isOverdue={isOverdue} />
                      {canEdit && (
                        <button
                          onClick={() => setEditingTicket(ticket)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: 12, padding: '3px 10px' }}
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Members tab */}
      {activeTab === 'members' && (
        <div>
          {isAdmin && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
              <button id="btn-add-member" className="btn btn-primary" onClick={() => setShowMemberModal(true)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add member
              </button>
            </div>
          )}
          <div className="card" style={{ overflow: 'hidden' }}>
            {members.map((m) => (
              <div
                key={m.user_id}
                className="table-row"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
              >
                {/* Left: avatar + info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                  <div className="avatar">{m.user.name[0].toUpperCase()}</div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {m.user.name}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {m.user.email}
                    </p>
                  </div>
                </div>

                {/* Right: role badge + actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span className={`badge badge-${m.user.role.toLowerCase()}`}>{m.user.role}</span>
                  {m.user_id === workspace.owner_id && (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>Owner</span>
                  )}
                  {isAdmin && m.user_id !== workspace.owner_id && m.user_id !== user.id && (
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ fontSize: 12 }}
                      onClick={() => handleRemoveMember(m.user_id)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(false)}>
          <div className="modal-box" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>Delete workspace?</h2>
            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: '0 0 20px', lineHeight: 1.6 }}>
              This will permanently delete <strong>{workspace.name}</strong> and all its tickets. This can't be undone.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDeleteWorkspace}>Yes, delete</button>
            </div>
          </div>
        </div>
      )}

      {showTicketModal && (
        <TicketFormModal title="New ticket" members={members} isAdmin={isAdmin} onClose={() => setShowTicketModal(false)} onSubmit={handleTicketCreated} />
      )}
      {editingTicket && (
        <TicketFormModal title="Edit ticket" ticket={editingTicket} members={members} isAdmin={isAdmin} onClose={() => setEditingTicket(null)} onSubmit={handleTicketUpdated} />
      )}
      {showMemberModal && (
        <AddMemberModal workspaceId={workspaceId} onClose={() => setShowMemberModal(false)} onAdded={load} />
      )}
    </div>
  );
}
