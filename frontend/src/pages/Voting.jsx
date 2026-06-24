import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import CandidateCard from '../components/CandidateCard';
import { ArrowLeft, Vote, AlertTriangle, ShieldCheck, HeartHandshake } from 'lucide-react';

const Voting = () => {
  const { electionId } = useParams();
  const { user, refreshUser } = useAuth();
  
  const [candidates, setCandidates] = useState([]);
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isCasting, setIsCasting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    // If user has already voted, navigate away immediately
    if (user?.votedElections?.includes(electionId)) {
      navigate(`/results/${electionId}`);
      return;
    }

    const fetchData = async () => {
      try {
        const [electionData, candidatesData] = await Promise.all([
          api.get(`/elections/${electionId}`),
          api.get(`/candidates/${electionId}`)
        ]);

        if (electionData.success) {
          setElection(electionData.election);
        }
        if (candidatesData.success) {
          setCandidates(candidatesData.candidates);
        }
      } catch (err) {
        setErrorMsg('Failed to load candidate listings. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [electionId, user, navigate]);

  const handleVoteSubmit = async (candidateId) => {
    const candidate = candidates.find((c) => c._id === candidateId);
    setSelectedCandidate(candidate);
    setErrorMsg('');
  };

  const confirmVote = async () => {
    if (!selectedCandidate) return;

    setIsCasting(true);
    setErrorMsg('');
    
    try {
      const data = await api.post('/vote', {
        electionId,
        candidateId: selectedCandidate._id
      });

      if (data.success) {
        setSuccessMsg('Your ballot has been cast and recorded successfully!');
        await refreshUser(); // Update client auth context so client knows they voted
        setTimeout(() => {
          navigate(`/results/${electionId}`);
        }, 2000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit vote. Please try again.');
      setSelectedCandidate(null);
    } finally {
      setIsCasting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-glass)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="container">
      {/* Back Button */}
      <Link to="/elections" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 500 }} className="navbar-link">
        <ArrowLeft size={16} />
        <span>Back to Registry</span>
      </Link>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }} className="animate-fade-in">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Vote size={28} style={{ color: 'var(--primary)' }} />
          <span>Active Ballot: {election?.title || 'Loading...'}</span>
        </h1>
        <p style={{ margin: 0 }}>Review the candidates below. You can vote for exactly ONE candidate. This action is final.</p>
      </div>

      {errorMsg && (
        <div className="glass-panel" style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '2rem' }}>
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="glass-panel" style={{ color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.2)', background: 'rgba(16, 185, 129, 0.05)', display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '2rem' }}>
          <ShieldCheck size={20} style={{ color: 'var(--success)', flexShrink: 0 }} />
          <span style={{ fontWeight: 600 }}>{successMsg}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      {selectedCandidate && !successMsg && (
        <div className="glass-card animate-fade-in" style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          width: '90%',
          maxWidth: '460px',
          background: 'var(--bg-secondary)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <HeartHandshake size={48} style={{ color: 'var(--primary)', marginBottom: '0.75rem' }} />
            <h2 style={{ fontSize: '1.5rem' }}>Confirm Your Ballot</h2>
            <p>You are about to cast your vote for candidate:</p>
            <div style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', margin: '0.5rem 0' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{selectedCandidate.name}</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>{selectedCandidate.party}</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              ℹ️ Once submitted, this vote cannot be changed, reversed, or deleted.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              disabled={isCasting} 
              onClick={() => setSelectedCandidate(null)} 
              className="btn btn-secondary" 
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button 
              disabled={isCasting} 
              onClick={confirmVote} 
              className="btn btn-primary" 
              style={{ flex: 1 }}
            >
              {isCasting ? 'Casting...' : 'Confirm Vote'}
            </button>
          </div>
        </div>
      )}

      {/* Backdrop for Confirmation Modal */}
      {selectedCandidate && (
        <div 
          onClick={() => !isCasting && setSelectedCandidate(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 999
          }}
        />
      )}

      {/* Candidate Selection List */}
      {candidates.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No candidates registered for this ballot.</p>
        </div>
      ) : (
        <div className="candidate-card-list">
          {candidates.map((candidate) => (
            <CandidateCard
              key={candidate._id}
              candidate={candidate}
              isAdmin={false}
              showVotes={false}
              onVote={handleVoteSubmit}
              isVoting={isCasting}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Voting;
