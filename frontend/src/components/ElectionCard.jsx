import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, Lock, BarChart3, Edit3 } from 'lucide-react';

const ElectionCard = ({ election, user, onActionClick, hasVoted }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="badge badge-active">
            <span className="live-dot" style={{ marginRight: '6px' }}></span>
            Active
          </span>
        );
      case 'upcoming':
        return (
          <span className="badge badge-upcoming">
            <Lock size={12} style={{ marginRight: '4px' }} />
            Upcoming
          </span>
        );
      case 'ended':
        return (
          <span className="badge badge-ended">
            Ended
          </span>
        );
      default:
        return null;
    }
  };

  const now = new Date();
  const startDate = new Date(election.startDate);
  const endDate = new Date(election.endDate);
  
  // Calculate status if outdated
  let currentStatus = election.status;
  if (startDate > now) {
    currentStatus = 'upcoming';
  } else if (endDate < now) {
    currentStatus = 'ended';
  } else {
    currentStatus = 'active';
  }

  const isAdmin = user && user.role === 'admin';

  return (
    <div className="glass-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{election.title}</h3>
          {getStatusBadge(currentStatus)}
        </div>
        
        <p style={{ minHeight: '50px', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          {election.description || 'No description provided.'}
        </p>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={14} style={{ color: 'var(--primary)' }} />
            <span><strong>Starts:</strong> {formatDate(election.startDate)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={14} style={{ color: 'var(--accent)' }} />
            <span><strong>Ends:</strong> {formatDate(election.endDate)}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
        {isAdmin ? (
          <>
            <Link to={`/admin/candidates?electionId=${election._id}`} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.85rem', padding: '0.6rem' }}>
              <Edit3 size={14} />
              Manage Candidates
            </Link>
          </>
        ) : (
          <>
            {currentStatus === 'active' && !hasVoted && (
              <Link to={`/vote/${election._id}`} className="btn btn-primary" style={{ flex: 2, fontSize: '0.85rem', padding: '0.6rem' }}>
                Cast Vote
              </Link>
            )}

            {currentStatus === 'active' && hasVoted && (
              <button className="btn btn-secondary" disabled style={{ flex: 2, fontSize: '0.85rem', padding: '0.6rem', color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                <CheckCircle2 size={14} />
                Voted
              </button>
            )}

            {currentStatus === 'upcoming' && (
              <button className="btn btn-secondary" disabled style={{ flex: 2, fontSize: '0.85rem', padding: '0.6rem' }}>
                <Lock size={14} />
                Locked
              </button>
            )}

            {/* Results visible to voters if they have voted, or if election ended */}
            {(currentStatus === 'ended' || hasVoted) && (
              <Link to={`/results/${election._id}`} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.85rem', padding: '0.6rem', display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                <BarChart3 size={14} />
                Results
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ElectionCard;
