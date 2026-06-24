import React from 'react';
import { Vote, CheckCircle2 } from 'lucide-react';

const VoteButton = ({ hasVoted, isVoting, onClick, disabled }) => {
  if (hasVoted) {
    return (
      <button 
        className="btn btn-secondary btn-full" 
        disabled 
        style={{ 
          color: 'var(--success)', 
          borderColor: 'rgba(16, 185, 129, 0.2)',
          cursor: 'not-allowed'
        }}
      >
        <CheckCircle2 size={16} />
        <span>Voted in this Election</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={isVoting || disabled}
      className="btn btn-primary btn-full animate-fade-in"
      style={{
        boxShadow: isVoting ? 'none' : 'var(--shadow-glow)'
      }}
    >
      <Vote size={18} />
      <span>{isVoting ? 'Submitting Vote...' : 'Submit Vote'}</span>
    </button>
  );
};

export default VoteButton;
