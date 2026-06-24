import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import ResultChart from '../components/ResultChart';
import { BarChart3, ArrowLeft, Trophy, Users, ShieldAlert, Sparkles } from 'lucide-react';

const Results = () => {
  const { electionId } = useParams();
  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await api.get(`/vote/results/${electionId}`);
        if (data.success) {
          setResultsData(data);
        }
      } catch (err) {
        setErrorMsg('Unable to retrieve results. Please verify the URL or try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [electionId]);

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-glass)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (errorMsg || !resultsData) {
    return (
      <div className="container">
        <Link to="/elections" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '1.5rem' }} className="navbar-link">
          <ArrowLeft size={16} />
          <span>Back to Registry</span>
        </Link>
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1.5rem', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <ShieldAlert size={48} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
          <h3>Error Loading Results</h3>
          <p>{errorMsg || 'Results could not be fetched.'}</p>
        </div>
      </div>
    );
  }

  const { election, totalVotes, candidates, winner } = resultsData;
  const isEnded = election.status === 'ended';

  return (
    <div className="container">
      {/* Back Button */}
      <Link to="/elections" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 500 }} className="navbar-link">
        <ArrowLeft size={16} />
        <span>Back to Registry</span>
      </Link>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }} className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <BarChart3 size={28} style={{ color: 'var(--primary)' }} />
              <span>Results: {election.title}</span>
            </h1>
            <p style={{ margin: 0, maxWidth: '600px' }}>
              {election.description || 'Ballot results dashboard.'}
            </p>
          </div>
          <span className={`badge ${isEnded ? 'badge-ended' : 'badge-active'}`}>
            {!isEnded && <span className="live-dot" style={{ marginRight: '6px' }}></span>}
            {isEnded ? 'Results Official' : 'Live Vote Count'}
          </span>
        </div>
      </div>

      {/* Winner Announcement */}
      {winner && winner.length > 0 && (
        <div className="winner-banner animate-fade-in">
          <Trophy size={32} className="winner-icon" />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} />
              <span>{isEnded ? 'Election Winner' : 'Current Frontrunner'}</span>
            </h3>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
              {winner.map(w => `${w.name} (${w.party})`).join(' & ')}
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginLeft: '0.75rem' }}>
              with {winner[0].voteCount} votes
            </span>
          </div>
        </div>
      )}

      {/* Stats Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginTop: '2rem', alignItems: 'start' }} className="responsive-split">
        
        {/* Left Side: Summary & Progress Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 'var(--radius-sm)', color: 'var(--primary)' }}>
                <Users size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block' }}>Total Ballots Cast</span>
                <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{totalVotes}</span>
              </div>
            </div>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              This tally updates dynamically as secure votes are registered by voters on the platform.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Vote Distribution</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {candidates.map((candidate) => (
                <div key={candidate.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 500 }}>{candidate.name} ({candidate.party})</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{candidate.voteCount} ({candidate.percentage}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', border: '1px solid var(--border-glass)', overflow: 'hidden' }}>
                    <div style={{
                      width: `${candidate.percentage}%`,
                      height: '100%',
                      background: 'var(--primary-gradient)',
                      borderRadius: '4px',
                      transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Graph */}
        <div className="glass-card animate-fade-in" style={{ height: '100%', minHeight: '430px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Visual Tally</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Bar chart representation of vote share per candidate. Hover on columns for detailed party and tally info.
          </p>
          <ResultChart data={candidates} />
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 900px) {
          .responsive-split {
            grid-template-columns: 1fr !important;
          }
        }
      `}} />
    </div>
  );
};

export default Results;
