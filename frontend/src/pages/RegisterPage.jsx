import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'MEMBER' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, justifyContent: 'center' }}>
          <div style={{ width: 32, height: 32, borderRadius: 7, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 17.5h7M17.5 14v7"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>BrikWork</span>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '28px 28px' }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Create your account</h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 22 }}>Start managing your projects.</p>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            <div>
              <label className="label" htmlFor="reg-name">Full name</label>
              <input id="reg-name" className="input" type="text" name="name" value={form.name} onChange={handle} placeholder="Alice Smith" required />
            </div>
            <div>
              <label className="label" htmlFor="reg-email">Email address</label>
              <input id="reg-email" className="input" type="email" name="email" value={form.email} onChange={handle} placeholder="you@example.com" required />
            </div>
            <div>
              <label className="label" htmlFor="reg-password">Password</label>
              <input id="reg-password" className="input" type="password" name="password" value={form.password} onChange={handle} placeholder="At least 6 characters" required />
            </div>
            <div>
              <label className="label" htmlFor="reg-role">Role</label>
              <select id="reg-role" className="input" name="role" value={form.role} onChange={handle} style={{ cursor: 'pointer' }}>
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {error && (
              <div style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)', borderRadius: 6, padding: '8px 12px' }}>
                <p className="form-error">{error}</p>
              </div>
            )}

            <button id="reg-submit" className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '9px 14px', marginTop: 2 }}>
              {loading ? <span className="spinner" /> : 'Create account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13.5, color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
