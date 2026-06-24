import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Calendar, Plus, Trash2, Edit2, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminElections = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Form states
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Candidates sub-form states (only for creation mode)
  const [formCandidates, setFormCandidates] = useState([]);
  const [candidateName, setCandidateName] = useState('');
  const [candidateParty, setCandidateParty] = useState('');
  const [candidateImageUrl, setCandidateImageUrl] = useState('');

  const fetchElections = async () => {
    try {
      const data = await api.get('/elections');
      if (data.success) {
        setElections(data.elections);
      }
    } catch (err) {
      setErrorMsg('Failed to load elections registry.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const handleAddCandidateToForm = (e) => {
    e.preventDefault();
    if (!candidateName || !candidateParty) {
      setErrorMsg('Candidate Name and Party are required to add a member.');
      return;
    }
    setErrorMsg('');
    const newCand = {
      name: candidateName,
      party: candidateParty,
      imageUrl: candidateImageUrl
    };
    setFormCandidates([...formCandidates, newCand]);
    setCandidateName('');
    setCandidateParty('');
    setCandidateImageUrl('');
  };

  const handleRemoveCandidateFromForm = (index) => {
    setFormCandidates(formCandidates.filter((_, idx) => idx !== index));
  };

  const handleEdit = (election) => {
    setEditingId(election._id);
    setTitle(election.title);
    setDescription(election.description || '');
    setFormCandidates([]); // Clear dynamic candidates preview when entering Edit mode
    
    // Format dates to fit datetime-local inputs (YYYY-MM-DDTHH:MM)
    const formatToDatetimeLocal = (dateString) => {
      const date = new Date(dateString);
      const ten = (i) => (i < 10 ? '0' : '') + i;
      const YYYY = date.getFullYear();
      const MM = ten(date.getMonth() + 1);
      const DD = ten(date.getDate());
      const HH = ten(date.getHours());
      const MIN = ten(date.getMinutes());
      return `${YYYY}-${MM}-${DD}T${HH}:${MIN}`;
    };

    setStartDate(formatToDatetimeLocal(election.startDate));
    setEndDate(formatToDatetimeLocal(election.endDate));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setFormCandidates([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !startDate || !endDate) {
      return setErrorMsg('Please fill in all required fields.');
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return setErrorMsg('Start date must be before end date.');
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const body = { title, description, startDate, endDate };
      
      let response;
      if (editingId) {
        response = await api.put(`/elections/${editingId}`, body);
        if (response.success) {
          setSuccessMsg('Election updated successfully!');
          setElections(elections.map(el => el._id === editingId ? response.election : el));
          handleCancelEdit();
        }
      } else {
        response = await api.post('/elections', body);
        if (response.success) {
          const electionId = response.election._id;
          
          // Bulk-insert the candidates that were defined in the form
          if (formCandidates.length > 0) {
            const candPromises = formCandidates.map(cand => 
              api.post('/candidates', {
                name: cand.name,
                party: cand.party,
                imageUrl: cand.imageUrl,
                electionId
              })
            );
            await Promise.all(candPromises);
          }

          setSuccessMsg(`Ballot created successfully with ${formCandidates.length} contesting candidates!`);
          
          // Refresh list of elections
          fetchElections();
          handleCancelEdit();
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (electionId) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this election? This removes all associated candidates and votes!')) {
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      const data = await api.delete(`/elections/${electionId}`);
      if (data.success) {
        setSuccessMsg('Election deleted successfully.');
        setElections(elections.filter(el => el._id !== electionId));
      }
    } catch (err) {
      setErrorMsg(err.message || 'Deletion failed.');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
      {/* Title */}
      <div style={{ marginBottom: '2rem' }} className="animate-fade-in">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Calendar size={28} style={{ color: 'var(--primary)' }} />
          <span>Election Event Management</span>
        </h1>
        <p style={{ margin: 0 }}>Configure ballot parameters, update dates, and monitor status schedules.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }} className="responsive-split">
        
        {/* Form panel */}
        <div className="glass-card animate-fade-in" style={{ height: 'fit-content' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} style={{ color: 'var(--primary)' }} />
            <span>{editingId ? 'Modify Ballot' : 'Create New Ballot'}</span>
          </h3>

          {errorMsg && (
            <div className="glass-panel" style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.25rem' }}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="glass-panel" style={{ color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.2)', background: 'rgba(16, 185, 129, 0.05)', display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Election Title</label>
              <input
                type="text"
                className="input-glass"
                placeholder="e.g. Presidential Election 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="input-glass"
                placeholder="Details about the voting rules, candidate qualifications, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input
                type="datetime-local"
                className="input-glass"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Time</label>
              <input
                type="datetime-local"
                className="input-glass"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>

            {/* Candidates/Members Addition Section (only when creating new ballot) */}
            {!editingId && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--primary)' }}>Contesting Candidates (Members)</h4>
                
                {/* Mini Candidate Form */}
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', background: 'rgba(0,0,0,0.1)' }}>
                  <input
                    type="text"
                    className="input-glass"
                    placeholder="Candidate Full Name"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                  />
                  <input
                    type="text"
                    className="input-glass"
                    placeholder="Party Name"
                    value={candidateParty}
                    onChange={(e) => setCandidateParty(e.target.value)}
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                  />
                  <input
                    type="url"
                    className="input-glass"
                    placeholder="Logo Image URL (Optional)"
                    value={candidateImageUrl}
                    onChange={(e) => setCandidateImageUrl(e.target.value)}
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCandidateToForm}
                    className="btn btn-secondary"
                    style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem', fontWeight: 600 }}
                  >
                    + Add Candidate to Ballot
                  </button>
                </div>

                {/* Local Candidates Preview List */}
                {formCandidates.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '150px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Ballot Preview List:</span>
                    {formCandidates.map((cand, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.35rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', fontSize: '0.8rem' }}>
                        <div>
                          <strong>{cand.name}</strong> <span style={{ color: 'var(--text-muted)' }}>({cand.party})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCandidateFromForm(idx)}
                          style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {editingId && (
                <button type="button" onClick={handleCancelEdit} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
              )}
              <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ flex: 2 }}>
                <span>{editingId ? 'Update' : 'Create'} Ballot</span>
              </button>
            </div>
          </form>
        </div>

        {/* Elections list */}
        <div className="glass-card animate-fade-in">
          <h3 style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>Active & Historical Ballots</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {elections.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem 0' }}>No election events have been configured.</p>
            ) : (
              elections.map((el) => (
                <div key={el._id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.15rem' }}>{el.title}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>{el.description}</p>
                    </div>
                    <span className={`badge ${el.status === 'active' ? 'badge-active' : el.status === 'upcoming' ? 'badge-upcoming' : 'badge-ended'}`}>
                      {el.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-glass)', paddingTop: '0.75rem' }}>
                    <div>
                      <span><strong>Starts:</strong> {formatDate(el.startDate)}</span>
                      <span style={{ marginLeft: '1rem' }}><strong>Ends:</strong> {formatDate(el.endDate)}</span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link to={`/admin/candidates?electionId=${el._id}`} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                        Candidates
                      </Link>
                      <button onClick={() => handleEdit(el)} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center' }}>
                        <Edit2 size={12} />
                      </button>
                      <button onClick={() => handleDelete(el._id)} className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center' }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

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

export default AdminElections;
