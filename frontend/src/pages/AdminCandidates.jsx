import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import CandidateCard from '../components/CandidateCard';
import { Users, Plus, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';

const AdminCandidates = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const electionIdFromParam = searchParams.get('electionId') || '';

  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState(electionIdFromParam);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [name, setName] = useState('');
  const [party, setParty] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch elections list on mount
  useEffect(() => {
    const fetchElections = async () => {
      try {
        const data = await api.get('/elections');
        if (data.success) {
          setElections(data.elections);
          if (!selectedElectionId && data.elections.length > 0) {
            setSelectedElectionId(data.elections[0]._id);
            setSearchParams({ electionId: data.elections[0]._id });
          }
        }
      } catch (err) {
        setErrorMsg('Failed to load elections registry.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchElections();
  }, [selectedElectionId, setSearchParams]);

  // Fetch candidates whenever selectedElectionId changes
  useEffect(() => {
    if (!selectedElectionId) return;

    const fetchCandidates = async () => {
      try {
        const data = await api.get(`/candidates/${selectedElectionId}`);
        if (data.success) {
          setCandidates(data.candidates);
        }
      } catch (err) {
        console.error('Failed to load candidates:', err);
      }
    };

    fetchCandidates();
  }, [selectedElectionId]);

  const handleElectionChange = (e) => {
    const id = e.target.value;
    setSelectedElectionId(id);
    setSearchParams({ electionId: id });
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!name || !party || !selectedElectionId) {
      return setErrorMsg('Please fill in candidate name and political party.');
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const data = await api.post('/candidates', {
        name,
        party,
        imageUrl,
        electionId: selectedElectionId
      });

      if (data.success) {
        setSuccessMsg(`Candidate ${name} added successfully!`);
        setCandidates([...candidates, data.candidate]);
        setName('');
        setParty('');
        setImageUrl('');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add candidate.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCandidate = async (candidateId) => {
    if (!window.confirm('Are you sure you want to remove this candidate?')) {
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');

    try {
      const data = await api.delete(`/candidates/${candidateId}`);
      if (data.success) {
        setSuccessMsg('Candidate removed successfully.');
        setCandidates(candidates.filter(c => c._id !== candidateId));
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to remove candidate.');
    }
  };

  const selectedElection = elections.find(e => e._id === selectedElectionId);

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-glass)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="container">
      {/* Back to elections */}
      <Link to="/admin/elections" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 500 }} className="navbar-link">
        <ArrowLeft size={16} />
        <span>Back to Events Registry</span>
      </Link>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }} className="animate-fade-in">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Users size={28} style={{ color: 'var(--primary)' }} />
          <span>Election Candidates Manager</span>
        </h1>
        <p style={{ margin: 0 }}>Enlist and manage candidates contesting for a specific election event.</p>
      </div>

      {/* Selector dropdown */}
      <div className="glass-panel animate-fade-in" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem', padding: '1rem' }}>
        <label style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', flexShrink: 0 }}>Configure Election Event:</label>
        <select 
          className="input-glass" 
          value={selectedElectionId} 
          onChange={handleElectionChange}
          style={{ maxWidth: '400px', cursor: 'pointer' }}
        >
          {elections.length === 0 ? (
            <option value="">No elections available</option>
          ) : (
            elections.map(e => (
              <option key={e._id} value={e._id}>{e.title} ({e.status})</option>
            ))
          )}
        </select>
      </div>

      {errorMsg && (
        <div className="glass-panel" style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '2rem' }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="glass-panel" style={{ color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.2)', background: 'rgba(16, 185, 129, 0.05)', display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '2rem' }}>
          <span>{successMsg}</span>
        </div>
      )}

      {selectedElectionId ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }} className="responsive-split">
          
          {/* Add candidate form */}
          <div className="glass-card animate-fade-in" style={{ height: 'fit-content' }}>
            <h3 style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} style={{ color: 'var(--primary)' }} />
              <span>Register Candidate</span>
            </h3>

            <form onSubmit={handleAddCandidate}>
              <div className="form-group">
                <label className="form-label">Candidate Name</label>
                <input
                  type="text"
                  className="input-glass"
                  placeholder="e.g. Eleanor Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Political Party</label>
                <input
                  type="text"
                  className="input-glass"
                  placeholder="e.g. Progressive Party"
                  value={party}
                  onChange={(e) => setParty(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Image Logo URL (Optional)</label>
                <input
                  type="url"
                  className="input-glass"
                  placeholder="https://example.com/logo.png"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>

              <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-full">
                <span>Add Candidate</span>
              </button>
            </form>
          </div>

          {/* Candidates list display */}
          <div className="glass-card animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Active Candidates Registry</h3>
              <span className="badge badge-active">{candidates.length} Registered</span>
            </div>

            {candidates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                <p style={{ color: 'var(--text-secondary)' }}>No candidates are registered for this election.</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Use the left panel to register candidates contesting in this ballot.</p>
              </div>
            ) : (
              <div className="candidate-card-list" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                {candidates.map(candidate => (
                  <CandidateCard
                    key={candidate._id}
                    candidate={candidate}
                    isAdmin={true}
                    showVotes={selectedElection?.status === 'ended'}
                    onDelete={handleDeleteCandidate}
                    totalVotes={candidates.reduce((sum, c) => sum + (c.voteCount || 0), 0)}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="glass-card animate-fade-in" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Please create an election event first from the Elections Management tab before registering candidates.</p>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .responsive-split {
            grid-template-columns: 1fr !important;
          }
        }
      `}} />
    </div>
  );
};

export default AdminCandidates;
