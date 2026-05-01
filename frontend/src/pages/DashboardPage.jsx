import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const STAT_CONFIG = [
  { key: 'TODO',        label: 'To Do',      color: '#64748b', rgb: '100,116,139', badgeClass: 'badge-todo'       },
  { key: 'IN_PROGRESS', label: 'In Progress', color: '#b45309', rgb: '180,83,9',   badgeClass: 'badge-inprogress' },
  { key: 'DONE',        label: 'Done',        color: '#16a34a', rgb: '22,163,74',  badgeClass: 'badge-done'       },
  { key: 'OVERDUE',     label: 'Overdue',     color: '#dc2626', rgb: '220,38,38',  badgeClass: 'badge-overdue'    },
];

function StatCard({ config, value, active, onClick }) {
  return (
    <div
      id={`stat-${config.key.toLowerCase()}`}
      className={`stat-card ${active ? 'active' : ''}`}
      onClick={onClick}
      style={{ '--stat-color': config.color, '--stat-rgb': config.rgb }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <p className="stat-label" style={active ? { color: config.color } : {}}>{config.label}</p>
      <p className="stat-value" style={active ? { color: config.color } : {}}>{value}</p>
      <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
        {active ? 'Showing below ↓' : 'Click to filter'}
      </p>
    </div>
  );
}

function TicketRow({ ticket }) {
  const isOverdue = ticket.is_overdue;
  const statusClass = { TODO: 'badge-todo', IN_PROGRESS: 'badge-inprogress', DONE: 'badge-done' }[ticket.status] || 'badge-todo';
  const label = { TODO: 'Todo', IN_PROGRESS: 'In Progress', DONE: 'Done' }[ticket.status] || ticket.status;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '11px 0', borderBottom: '1px solid var(--border)', gap: 12
    }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ margin: 0, fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {ticket.title}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
          {ticket.workspace?.name}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {isOverdue && <span className="badge badge-overdue">Overdue</span>}
        <span className={`badge ${statusClass}`}>{label}</span>
        {ticket.due_date && (
          <span style={{ fontSize: 12, color: isOverdue ? 'var(--error)' : 'var(--text-muted)', flexShrink: 0 }}>
            {format(new Date(ticket.due_date), 'MMM d')}
          </span>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState(null); // null = show all

  useEffect(() => {
    dashboardApi.getStats()
      .then((res) => setStats(res.data.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: 80 }}>
      <div className="spinner spinner-dark" style={{ width: 28, height: 28, borderWidth: 2.5 }} />
    </div>
  );

  if (error) return (
    <div style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)', borderRadius: 8, padding: '12px 16px', color: 'var(--error)', fontSize: 13.5 }}>
      {error}
    </div>
  );

  const { ticketStats, workspaceProgress, myTickets } = stats;

  // Filter tickets based on active stat card
  const filteredTickets = filter === 'OVERDUE'
    ? myTickets.filter((t) => t.is_overdue)
    : filter
    ? myTickets.filter((t) => t.status === filter)
    : myTickets;

  const handleStatClick = (key) => {
    setFilter((prev) => (prev === key ? null : key));
    // Scroll to My Tickets section
    setTimeout(() => {
      document.getElementById('my-tickets-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const countFor = (key) => {
    if (key === 'OVERDUE') return ticketStats.OVERDUE;
    return ticketStats[key] ?? 0;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Dashboard</h1>
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 3 }}>
          Hi {user.name.split(' ')[0]}, here's an overview of your work.
        </p>
      </div>

      {/* Stat cards — clickable, filter the tickets below */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {STAT_CONFIG.map((cfg) => (
          <StatCard
            key={cfg.key}
            config={cfg}
            value={countFor(cfg.key)}
            active={filter === cfg.key}
            onClick={() => handleStatClick(cfg.key)}
          />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Workspace Progress */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.1px' }}>Workspace Progress</h2>
            <Link to="/workspaces" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
              View all →
            </Link>
          </div>
          {workspaceProgress.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0', textAlign: 'left' }}>
              <p className="empty-sub">No workspaces yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {workspaceProgress.map((ws) => (
                <Link key={ws.id} to={`/workspaces/${ws.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)' }}>{ws.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0, marginLeft: 8 }}>
                      {ws.progressPercentage}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${ws.progressPercentage}%` }} />
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    {ws.doneTickets} of {ws.totalTickets} tickets done
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* My Tickets — filterable */}
        <div className="card" style={{ padding: 20 }} id="my-tickets-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.1px' }}>My Tickets</h2>
              {filter && (
                <p style={{ fontSize: 12, color: 'var(--accent)', marginTop: 2 }}>
                  Filtered: {STAT_CONFIG.find(c => c.key === filter)?.label}
                </p>
              )}
            </div>
            {filter && (
              <button
                onClick={() => setFilter(null)}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 12 }}
              >
                Clear filter ×
              </button>
            )}
          </div>

          {filteredTickets.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0', textAlign: 'left' }}>
              <p className="empty-sub">
                {filter ? `No ${STAT_CONFIG.find(c => c.key === filter)?.label.toLowerCase()} tickets.` : 'Nothing assigned to you.'}
              </p>
            </div>
          ) : (
            <div>
              {filteredTickets.slice(0, 8).map((t) => (
                <TicketRow key={t.id} ticket={t} />
              ))}
              {filteredTickets.length > 8 && (
                <p style={{ fontSize: 12.5, color: 'var(--text-muted)', textAlign: 'center', paddingTop: 12 }}>
                  +{filteredTickets.length - 8} more
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 860px) {
          .stat-grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
          .two-col { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 520px) {
          .stat-grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
