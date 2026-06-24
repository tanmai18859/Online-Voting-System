import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, ShieldCheck, Mail, Save, Clock, HelpCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [votedElectionsList, setVotedElectionsList] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.get('/elections');
        if (data.success) {
          // Filter only elections the user has voted in
          const votedList = data.elections.filter(e => user?.votedElections?.includes(e._id));
          setVotedElectionsList(votedList);
        }
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoadingHistory(false);
      }
    };

    if (user) {
      fetchHistory();
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      return setErrorMsg('Name and Email are required.');
    }

    setIsUpdating(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // In our auth controller we didn't add a profile update route, let's make sure it handles updating correctly or simulate success for now.
      // Wait! We should verify if the backend supports updating the profile.
      // Let's create a PUT /api/auth/profile route in the backend!
      // Wait, let's implement the backend PUT route in controllers/authController.js first? No, we can edit it if needed. But to make this absolutely work, let's write a PUT route or handle update.
      // Wait! Let's check our auth controller. We didn't define a profile update API.
      // Let's create a profile update route at PUT /api/auth/profile in the backend, it will be extremely professional and ensures the profile update button works perfectly!
      // First let's write the code here to call PUT /api/auth/profile.
      const response = await api.put('/auth/profile', { name, email });
      if (response.success) {
        setSuccessMsg('Profile updated successfully!');
        await refreshUser();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }} className="animate-fade-in">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <User size={28} style={{ color: 'var(--primary)' }} />
          <span>My Profile</span>
        </h1>
        <p style={{ margin: 0 }}>Manage your personal details and view your participation history.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="responsive-split">
        
        {/* Left Side: Profile Details */}
        <div className="glass-card animate-fade-in" style={{ height: 'fit-content' }}>
          <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Account Information</h3>
            <span className={`badge ${user?.role === 'admin' ? 'badge-admin' : 'badge-active'}`}>
              <ShieldCheck size={12} style={{ marginRight: '4px' }} />
              {user?.role}
            </span>
          </div>

          {errorMsg && (
            <div className="glass-panel" style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.25rem' }}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="glass-panel" style={{ color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.2)', background: 'rgba(16, 185, 129, 0.05)', display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.25rem' }}>
              <CheckCircle size={18} style={{ color: 'var(--success)' }} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="input-glass"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className="input-glass"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={isUpdating} className="btn btn-primary" style={{ width: '100%' }}>
              <Save size={16} />
              <span>{isUpdating ? 'Saving...' : 'Update Details'}</span>
            </button>
          </form>
        </div>

        {/* Right Side: Voting History */}
        <div className="glass-card animate-fade-in">
          <h3 style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} style={{ color: 'var(--primary)' }} />
            <span>Voting History</span>
          </h3>

          {loadingHistory ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: '30px', height: '30px', margin: '0 auto', border: '3px solid var(--border-glass)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : votedElectionsList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: 'rgba(255,255,255,0.01)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-glass)' }}>
              <HelpCircle size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>You haven't cast any ballots yet.</p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Participate in active elections to view them here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {votedElectionsList.map((election) => (
                <div key={election._id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem' }}>{election.title}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status: {election.status}</span>
                  </div>
                  <Link to={`/results/${election._id}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                    View Results
                  </Link>
                </div>
              ))}
            </div>
          )}
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

export default Profile;
