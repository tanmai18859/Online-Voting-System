import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import ElectionCard from '../components/ElectionCard';
import { Calendar, Search, SlidersHorizontal, AlertCircle } from 'lucide-react';

const Elections = () => {
  const { user } = useAuth();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const data = await api.get('/elections');
        if (data.success) {
          setElections(data.elections);
        }
      } catch (err) {
        setErrorMsg('Failed to retrieve elections list. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchElections();
  }, []);

  const getCalculatedStatus = (election) => {
    const now = new Date();
    const startDate = new Date(election.startDate);
    const endDate = new Date(election.endDate);
    
    if (startDate > now) return 'upcoming';
    if (endDate < now) return 'ended';
    return 'active';
  };

  // Filter logic
  const filteredElections = elections.filter((election) => {
    const calculatedStatus = getCalculatedStatus(election);
    
    const matchesSearch = election.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (election.description && election.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || calculatedStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-glass)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="container">
      {/* Title */}
      <div style={{ marginBottom: '2rem' }} className="animate-fade-in">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Calendar size={28} style={{ color: 'var(--primary)' }} />
          <span>Elections Registry</span>
        </h1>
        <p style={{ margin: 0 }}>Browse active ballots, check upcoming schedules, and review historical outcomes.</p>
      </div>

      {/* Search and Filters */}
      <div className="glass-panel animate-fade-in" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', padding: '1rem' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-glass"
            placeholder="Search elections by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem', paddingRight: '1rem' }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <SlidersHorizontal size={16} style={{ color: 'var(--text-secondary)' }} />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Status:</span>
          
          <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(15,23,42,0.5)', padding: '0.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
            {['all', 'active', 'upcoming', 'ended'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  background: statusFilter === status ? 'var(--primary-gradient)' : 'transparent',
                  color: statusFilter === status ? '#fff' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: 'calc(var(--radius-sm) - 4px)',
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'var(--transition)'
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

      </div>

      {errorMsg && (
        <div className="glass-panel" style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '2rem' }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid Display */}
      {filteredElections.length === 0 ? (
        <div className="glass-card animate-fade-in" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '0.25rem' }}>No elections found matching filters.</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Try refining your search keyword or clearing the filters.</p>
        </div>
      ) : (
        <div className="card-grid animate-fade-in">
          {filteredElections.map((election) => (
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
  );
};

export default Elections;
