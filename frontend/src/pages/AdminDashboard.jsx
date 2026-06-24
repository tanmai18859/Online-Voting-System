import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Shield, Users, Calendar, Vote, UserX, UserCheck, AlertCircle, Database, BarChart3, Trophy, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import ResultChart from '../components/ResultChart';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [elections, setElections] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // Analysis states
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [electionResults, setElectionResults] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [usersData, electionsData, auditData] = await Promise.all([
        api.get('/auth/users'),
        api.get('/elections'),
        api.get('/vote/audit')
      ]);

      if (usersData.success) setUsers(usersData.users);
      if (electionsData.success) {
        setElections(electionsData.elections);
        if (electionsData.elections.length > 0) {
          setSelectedElectionId(electionsData.elections[0]._id);
        }
      }
      if (auditData.success) setAuditLogs(auditData.votes);
    } catch (err) {
      setErrorMsg('Failed to load administration console. Check server status.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch election breakdown results on selection change
  useEffect(() => {
    if (!selectedElectionId) return;

    const fetchResults = async () => {
      setLoadingResults(true);
      try {
        const data = await api.get(`/vote/results/${selectedElectionId}`);
        if (data.success) {
          setElectionResults(data);
        }
      } catch (err) {
        console.error('Failed to load election analysis results:', err);
      } finally {
        setLoadingResults(false);
      }
    };

    fetchResults();
  }, [selectedElectionId]);

  const handleToggleBlock = async (userId) => {
    setActionLoading(userId);
    setErrorMsg('');
    try {
      const data = await api.put(`/auth/users/${userId}/block`, {});
      if (data.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, isBlocked: !u.isBlocked } : u));
      }
    } catch (err) {
      setErrorMsg(err.message || 'Action failed.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-glass)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const activeElectionsCount = elections.filter(e => e.status === 'active').length;

  return (
    <div className="container">
      {/* Admin Title */}
      <div style={{ marginBottom: '2rem' }} className="animate-fade-in">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Shield size={28} style={{ color: 'var(--primary)' }} />
          <span>Security Administration Panel</span>
        </h1>
        <p style={{ margin: 0 }}>System-wide diagnostics, voter registration logs, and security controls.</p>
      </div>

      {errorMsg && (
        <div className="glass-panel" style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Widget Diagnostics */}
      <div className="widget-grid animate-fade-in">
        <div className="widget-card">
          <div>
            <span className="widget-title">Total Registered Voters</span>
            <div className="widget-value">{users.length}</div>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>Unique voter accounts</p>
        </div>

        <div className="widget-card">
          <div>
            <span className="widget-title">Elections Hosted</span>
            <div className="widget-value">{elections.length}</div>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>{activeElectionsCount} currently active</p>
        </div>

        <div className="widget-card">
          <div>
            <span className="widget-title">Ballots Encrypted</span>
            <div className="widget-value">{auditLogs.length}</div>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>Total votes cast system-wide</p>
        </div>
      </div>

      {/* Election Analysis Console */}
      <div className="glass-card animate-fade-in" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.4rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={22} style={{ color: 'var(--primary)' }} />
            <span>Election Analysis Portal</span>
          </h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Select Election:</span>
            <select
              className="input-glass"
              value={selectedElectionId}
              onChange={(e) => setSelectedElectionId(e.target.value)}
              style={{ maxWidth: '280px', padding: '0.5rem 1rem', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              {elections.length === 0 ? (
                <option value="">No elections hosted</option>
              ) : (
                elections.map((el) => (
                  <option key={el._id} value={el._id}>{el.title} ({el.status})</option>
                ))
              )}
            </select>
          </div>
        </div>

        {loadingResults ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <div style={{ width: '35px', height: '35px', margin: '0 auto', border: '3px solid var(--border-glass)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : !electionResults ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '2rem 0' }}>Please select an election from the menu to inspect details.</p>
        ) : (
          <div>
            {/* Winner banner inside dashboard analysis */}
            {electionResults.winner && electionResults.winner.length > 0 && (
              <div className="winner-banner animate-fade-in" style={{ marginTop: 0, marginBottom: '1.5rem', padding: '1rem' }}>
                <Trophy size={24} className="winner-icon" />
                <div style={{ fontSize: '0.9rem' }}>
                  <strong style={{ color: 'var(--warning)', display: 'block' }}>
                    {electionResults.election.status === 'ended' ? '⭐ Final Election Winner' : '⭐ Current Frontrunner'}
                  </strong>
                  <span style={{ fontWeight: 700 }}>
                    {electionResults.winner.map(w => `${w.name} (${w.party})`).join(' & ')}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                    with {electionResults.winner[0].voteCount} votes ({electionResults.winner[0].percentage}%)
                  </span>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }} className="responsive-split">
              {/* Tally Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span>Status: <strong style={{ textTransform: 'capitalize', color: electionResults.election.status === 'active' ? 'var(--success)' : 'var(--text-muted)' }}>{electionResults.election.status}</strong></span>
                  <span>Total Votes: <strong>{electionResults.totalVotes}</strong></span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '230px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                  {electionResults.candidates.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>No candidates have been registered for this election.</p>
                  ) : (
                    electionResults.candidates.map((cand) => (
                      <div key={cand.id} className="glass-panel" style={{ padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ display: 'block', fontSize: '0.9rem' }}>{cand.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Party: {cand.party}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.95rem', fontWeight: 700, display: 'block' }}>{cand.voteCount} votes</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cand.percentage}% share</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Chart */}
              <div style={{ height: '300px' }}>
                {electionResults.candidates.length > 0 ? (
                  <ResultChart data={electionResults.candidates} />
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)' }}>
                    <span>Chart unavailable (no candidates)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Split Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }} className="responsive-split">
        
        {/* User Directory */}
        <div className="glass-card animate-fade-in">
          <h3 style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} style={{ color: 'var(--primary)' }} />
            <span>Voter Access Directory</span>
          </h3>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Voter Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Voted count</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((voter) => (
                  <tr key={voter._id} style={{ opacity: voter.isBlocked ? 0.6 : 1 }}>
                    <td>
                      <span style={{ fontWeight: 500 }}>{voter.name}</span>
                      {voter.isBlocked && <span className="badge badge-ended" style={{ fontSize: '0.65rem', marginLeft: '6px', padding: '0.1rem 0.4rem' }}>Blocked</span>}
                    </td>
                    <td>{voter.email}</td>
                    <td>
                      <span className={`badge ${voter.role === 'admin' ? 'badge-admin' : 'badge-active'}`} style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}>
                        {voter.role}
                      </span>
                    </td>
                    <td>{voter.votedElections?.length || 0}</td>
                    <td>
                      {voter.role === 'admin' ? (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>System Root</span>
                      ) : (
                        <button
                          disabled={actionLoading === voter._id}
                          onClick={() => handleToggleBlock(voter._id)}
                          className={`btn ${voter.isBlocked ? 'btn-success' : 'btn-danger'}`}
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          {voter.isBlocked ? (
                            <>
                              <UserCheck size={12} />
                              Unblock
                            </>
                          ) : (
                            <>
                              <UserX size={12} />
                              Block
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Logs */}
        <div className="glass-card animate-fade-in">
          <h3 style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={18} style={{ color: 'var(--primary)' }} />
            <span>Audit Trail Log</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {auditLogs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '2rem 0', fontSize: '0.9rem' }}>No votes recorded yet.</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log._id} className="glass-panel" style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                    <span style={{ color: 'var(--text-primary)' }}>{log.userId?.name || 'Anonymous Voter'}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    Voted in: <strong style={{ color: 'var(--primary)' }}>{log.electionId?.title || 'Unknown Election'}</strong>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    Candidate: <strong style={{ color: 'var(--success)' }}>{log.candidateId?.name} ({log.candidateId?.party})</strong>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 992px) {
          .responsive-split {
            grid-template-columns: 1fr !important;
          }
        }
      `}} />
    </div>
  );
};

export default AdminDashboard;
