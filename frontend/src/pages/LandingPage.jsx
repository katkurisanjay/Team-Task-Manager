import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  { title: 'Role-Based Access', desc: 'Admins manage, Members execute. Clear boundaries, zero confusion.', icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /><path d="M18 11l2 2 4-4" strokeLinecap="round" /></svg> },
  { title: 'Task Assignment', desc: 'Assign tasks to teammates with due dates and status tracking.', icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /><path d="M9 16l2 2 4-4" strokeLinecap="round" /></svg> },
  { title: 'Overdue Detection', desc: 'The backend flags overdue tasks automatically — no manual chasing.', icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" strokeLinecap="round" /></svg> },
  { title: 'Project Progress', desc: 'Visual progress bars show exactly how close each project is to done.', icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="4" rx="2" /><path d="M3 11V9a2 2 0 012-2h14a2 2 0 012 2v2" strokeLinecap="round" /></svg> },
  { title: 'Team Management', desc: 'Add or remove members per project. Access is always intentional.', icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="9" cy="7" r="4" /><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" /><path d="M19 8v6M22 11h-6" strokeLinecap="round" /></svg> },
  { title: 'Clean Dashboard', desc: 'One view: your tasks, your projects, what\'s late, what\'s next.', icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg> },
];

const STEPS = [
  { n: '1', title: 'Create a Project', desc: 'Admin sets up the workspace and defines the goal.' },
  { n: '2', title: 'Add Your Team', desc: 'Invite members — roles are assigned, access is set.' },
  { n: '3', title: 'Track & Ship', desc: 'Tasks move from TODO → IN_PROGRESS → DONE.' },
];

const STACK = ['Node.js', 'Express', 'PostgreSQL', 'Prisma', 'React', 'Vite', 'TailwindCSS', 'Railway'];

const ADMIN_PERMS = ['Create and delete projects', 'Add and remove members', 'Assign tasks to anyone', 'View all workspace dashboards'];
const MEMBER_PERMS = ['View assigned projects', 'Update task status', 'See personal dashboard', 'Track own progress'];

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const featureRefs = useRef([]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; } });
    }, { threshold: 0.1 });
    featureRefs.current.forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const scrollTo = id => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false); };

  const navStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
    background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
    backdropFilter: scrolled ? 'blur(8px)' : 'none',
    borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
    transition: 'all 250ms',
  };

  return (
    <div style={{ fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif', color: 'var(--text-primary)', background: '#fff' }}>

      {/* NAVBAR */}
      <nav style={navStyle}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 17.5h7M17.5 14v7" />
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.2px' }}>BrikWork</span>
          </div>
          <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {['features', 'how-it-works', 'roles'].map(id => (
              <button key={id} onClick={() => scrollTo(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 500, color: 'var(--text-secondary)', padding: '6px 10px', borderRadius: 6, fontFamily: 'inherit' }}
                onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
                {id === 'how-it-works' ? 'How It Works' : id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
            <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 6px' }} />
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/login')}>Login</button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>Get Started</button>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-menu-btn" style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: 'var(--text-secondary)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>
        </div>
        {menuOpen && (
          <div style={{ background: '#fff', borderTop: '1px solid var(--border)', padding: '12px 24px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {['features', 'how-it-works', 'roles'].map(id => (
              <button key={id} onClick={() => scrollTo(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', padding: '8px 0', textAlign: 'left', fontFamily: 'inherit' }}>
                {id === 'how-it-works' ? 'How It Works' : id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
            <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
            <button className="btn btn-secondary" onClick={() => navigate('/login')} style={{ width: '100%', marginBottom: 8 }}>Login</button>
            <button className="btn btn-primary" onClick={() => navigate('/register')} style={{ width: '100%' }}>Get Started Free</button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section style={{ paddingTop: 120, paddingBottom: 80, paddingLeft: 24, paddingRight: 24, maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--accent-light)', border: '1px solid var(--accent-border)', borderRadius: 20, padding: '4px 12px', fontSize: 12.5, fontWeight: 600, color: 'var(--accent)', marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            Full-stack team task manager
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-1px', marginBottom: 18, color: 'var(--text-primary)' }}>
            Stop losing track.<br />Start shipping together.
          </h1>
          <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 32, maxWidth: 440 }}>
            BrikWork gives your team one place to create projects, assign tasks, and track what's actually getting done — with real role-based access built in.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" style={{ fontSize: 14.5, padding: '10px 22px' }} onClick={() => navigate('/register')}>Get Started Free</button>
            <button className="btn btn-secondary" style={{ fontSize: 14.5, padding: '10px 22px' }} onClick={() => navigate('/login')}>Login</button>
          </div>
          <p style={{ marginTop: 16, fontSize: 12.5, color: 'var(--text-muted)' }}>No credit card. No setup fee. Just sign up.</p>
        </div>

        {/* Hero visual — CSS task card mockup */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Website Redesign</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>3 members</span>
          </div>
          <div style={{ background: 'var(--border)', borderRadius: 4, height: 5, overflow: 'hidden', marginBottom: 6 }}>
            <div style={{ width: '66%', height: '100%', background: 'var(--accent)', borderRadius: 4 }} />
          </div>
          {[
            { title: 'Design landing page', status: 'DONE', color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
            { title: 'Setup auth flow', status: 'IN PROGRESS', color: '#b45309', bg: '#fffbeb', border: '#fcd34d' },
            { title: 'Write API docs', status: 'TODO', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' },
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
              <span style={{ fontSize: 13.5, fontWeight: 500 }}>{t.title}</span>
              <span style={{ fontSize: 11.5, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: t.bg, color: t.color, border: `1px solid ${t.border}` }}>{t.status}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            {['A', 'B', 'C'].map((l, i) => (
              <div key={i} style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--accent-light)', border: '1.5px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>{l}</div>
            ))}
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>2 of 3 tickets done</span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ background: 'var(--bg-secondary)', padding: '72px 24px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 10 }}>Everything your team needs</h2>
            <p style={{ fontSize: 15.5, color: 'var(--text-secondary)' }}>Built around how developer teams actually work — not how product decks say they do.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {FEATURES.map((f, i) => (
              <div key={i} ref={el => featureRefs.current[i] = el}
                style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 10, padding: '22px 20px', opacity: 0, transform: 'translateY(20px)', transition: `opacity 400ms ${i * 80}ms, transform 400ms ${i * 80}ms` }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', marginBottom: 14 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 6 }}>{f.title}</h3>
                <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: '72px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 10 }}>Up and running in 3 steps</h2>
            <p style={{ fontSize: 15.5, color: 'var(--text-secondary)' }}>No onboarding call needed. Just sign up and go.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, position: 'relative' }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '0 32px', borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, margin: '0 auto 20px' }}>{s.n}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section id="roles" style={{ background: 'var(--bg-secondary)', padding: '72px 24px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 10 }}>Built for both sides of the table</h2>
            <p style={{ fontSize: 15.5, color: 'var(--text-secondary)' }}>Two roles. Clear responsibilities. No overlaps.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {[
              { role: 'Admin', perms: ADMIN_PERMS, accent: 'var(--accent)', accentLight: 'var(--accent-light)', border: 'var(--accent-border)' },
              { role: 'Member', perms: MEMBER_PERMS, accent: '#16a34a', accentLight: '#f0fdf4', border: '#86efac' },
            ].map(({ role, perms, accent, accentLight, border }) => (
              <div key={role} style={{ background: '#fff', border: `1.5px solid ${border}`, borderRadius: 10, padding: '24px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <span style={{ background: accentLight, color: accent, border: `1px solid ${border}`, borderRadius: 4, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>{role.toUpperCase()}</span>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>{role}</span>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {perms.map((p, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section style={{ padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 18 }}>Built with purpose, not defaults</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {STACK.map(s => (
            <span key={s} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 14px', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{s}</span>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ margin: '0 24px 80px', borderRadius: 14, background: 'var(--accent)', padding: '56px 40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 30, fontWeight: 800, color: '#fff', marginBottom: 10, letterSpacing: '-0.4px' }}>Ready to bring your team together?</h2>
        <p style={{ fontSize: 15.5, color: 'rgba(255,255,255,0.8)', marginBottom: 30 }}>Create your workspace in under a minute. No credit card required.</p>
        <button onClick={() => navigate('/register')} style={{ background: '#fff', color: 'var(--accent)', border: 'none', borderRadius: 8, padding: '11px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'transform 120ms, box-shadow 120ms', fontFamily: 'inherit' }}
          onMouseEnter={e => { e.target.style.transform = 'scale(1.03)'; e.target.style.boxShadow = '0 4px 14px rgba(0,0,0,0.15)'; }}
          onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = 'none'; }}>
          Create Your First Project
        </button>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: 14 }}>BrikWork</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 10 }}>Ship together, track everything.</span>
        </div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <a href="https://github.com/katkurisanjay/Team-Task-Manager" target="_blank" rel="noreferrer" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>GitHub</a>
          <a href="/login" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>Live App</a>
          <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>© 2026 Katkuri Sanjay</span>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          section[style*="grid-template-columns: 1fr 1fr"],
          section[style*="gridTemplateColumns: 1fr 1fr"],
          section[style*="repeat(3, 1fr)"],
          section[style*="repeat(2, 1fr)"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
