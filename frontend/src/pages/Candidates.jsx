import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import CandidateCard from '../components/CandidateCard';
import { Users, ArrowLeft, AlertCircle } from 'lucide-react';

const Candidates = () => {
  const { electionId } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
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
        setErrorMsg('Failed to load candidate listings. Please check back later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [electionId]);

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
          <Users size={28} style={{ color: 'var(--primary)' }} />
          <span>Contesting Candidates</span>
        </h1>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', fontWeight: 500, margin: 0 }}>
          Election: {election?.title || 'Loading...'}
        </h2>
      </div>

      {errorMsg && (
        <div className="glass-panel" style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '2rem' }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid Display */}
      {candidates.length === 0 ? (
        <div className="glass-card animate-fade-in" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '0.25rem' }}>No candidates found for this election.</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Check back later once the administrator lists official candidates.</p>
        </div>
      ) : (
        <div className="candidate-card-list animate-fade-in">
          {candidates.map((candidate) => (
            <CandidateCard
              key={candidate._id}
              candidate={candidate}
              isAdmin={false}
              showVotes={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Candidates;
