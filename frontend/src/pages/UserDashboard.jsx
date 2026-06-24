import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import ElectionCard from '../components/ElectionCard';
import { LayoutDashboard, CheckSquare, ListTodo, AlertCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  const { user } = useAuth();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await api.get('/elections');
        if (data.success) {
          setElections(data.elections);
        }
      } catch (err) {
        setErrorMsg('Failed to load dashboard data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const activeElections = elections.filter((e) => e.status === 'active');
  const votedCount = user?.votedElections?.length || 0;
  const pendingCount = activeElections.filter((e) => !user?.votedElections?.includes(e._id)).length;

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-glass)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="container">
      {/* Welcome Banner */}
      <div className="glass-card animate-fade-in" style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(15, 23, 42, 0.45) 100%)',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            <Sparkles size={14} />
            <span>Voter Dashboard</span>
          </div>
          <h1>Hello, {user?.name}!</h1>
          <p style={{ margin: 0, maxWidth: '600px' }}>
            Welcome back to DecideSecure. Your voice is secure, encrypted, and anonymous. Check the active ballots below to make your choices count.
          </p>
        </div>
        <div style={{
          position: 'absolute',
          right: '-50px',
          bottom: '-50px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'var(--primary-glow)',
          filter: 'blur(80px)',
          zIndex: 1
        }} />
      </div>

      {/* Widget Grid */}
      <div className="widget-grid animate-fade-in">
        <div className="widget-card">
          <div>
            <span className="widget-title">Elections Voted</span>
            <div className="widget-value">{votedCount}</div>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>Total votes cast by you</p>
        </div>

        <div className="widget-card">
          <div>
            <span className="widget-title">Pending Ballots</span>
            <div className="widget-value">{pendingCount}</div>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>Active elections you haven't voted in</p>
        </div>

        <div className="widget-card">
          <div>
            <span className="widget-title">Total Registered</span>
            <div className="widget-value">{elections.length}</div>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>All elections in the platform</p>
        </div>
      </div>

      {/* Active Ballot Section */}
      <div className="animate-fade-in" style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ListTodo size={22} style={{ color: 'var(--primary)' }} />
            <span>Active Ballots</span>
          </h2>
          <Link to="/elections" style={{ color: 'var(--primary)', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 600 }}>
            View All Elections &rarr;
          </Link>
        </div>

        {errorMsg && (
          <div className="glass-panel" style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {activeElections.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 0 }}>There are no active elections at this moment.</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Check back later or view upcoming events in the Elections panel.</p>
          </div>
        ) : (
          <div className="card-grid">
            {activeElections.map((election) => (
              <ElectionCard
                key={election._id}
                election={election}
                user={user}
                hasVoted={user?.votedElections?.includes(election._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
