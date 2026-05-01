import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 28px' }}>
          <Outlet />
        </div>
      </main>
      <style>{`
        @media (max-width: 767px) {
          main > div { padding: 20px 16px !important; }
        }
      `}</style>
    </div>
  );
}
