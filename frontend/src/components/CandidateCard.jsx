import React from 'react';
import { Trash2, Vote } from 'lucide-react';

const CandidateCard = ({ candidate, isAdmin = false, showVotes = false, onVote = null, onEdit = null, onDelete = null, isVoting = false, totalVotes = 0 }) => {
  // Get initials for profile fallback
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const votePercentage = totalVotes > 0 ? ((candidate.voteCount || 0) / totalVotes) * 100 : 0;

  return (
    <div className="glass-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1.5rem', position: 'relative' }}>
      
      {/* Fallback avatar */}
      <div className="candidate-avatar" style={{ marginBottom: '1rem' }}>
        {candidate.imageUrl ? (
          <img 
            src={candidate.imageUrl} 
            alt={candidate.name} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
        ) : null}
        <span style={{ fontSize: '1.25rem' }}>{getInitials(candidate.name)}</span>
      </div>

      <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{candidate.name}</h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: showVotes ? '0.5rem' : '1.5rem' }}>
        {candidate.party}
      </p>

      {showVotes && (
        <div style={{ width: '100%', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            <span>Votes: {candidate.voteCount || 0}</span>
            <span>{votePercentage.toFixed(1)}%</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'var(--border-glass)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              width: `${votePercentage}%`,
              height: '100%',
              background: 'var(--primary-gradient)',
              borderRadius: '3px',
              transition: 'width 1s ease-out'
            }} />
          </div>
        </div>
      )}

      {/* Conditional action buttons */}
      {isAdmin && (
        <div style={{ display: 'flex', gap: '0.5rem', width: '100%', marginTop: 'auto' }}>
          <button 
            onClick={() => onDelete(candidate._id)} 
            className="btn btn-danger btn-full" 
            style={{ padding: '0.5rem', fontSize: '0.85rem' }}
          >
            <Trash2 size={14} />
            <span>Remove</span>
          </button>
        </div>
      )}

      {!isAdmin && onVote && (
        <button
          onClick={() => onVote(candidate._id)}
          disabled={isVoting}
          className="btn btn-primary btn-full"
          style={{ 
            marginTop: 'auto', 
            fontSize: '0.9rem', 
            padding: '0.6rem',
            animation: isVoting ? 'none' : 'fadeIn 0.3s ease'
          }}
        >
          <Vote size={16} />
          <span>{isVoting ? 'Casting Vote...' : 'Vote'}</span>
        </button>
      )}
    </div>
  );
};

export default CandidateCard;
