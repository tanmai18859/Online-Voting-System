import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Page Imports
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import Elections from './pages/Elections';
import Candidates from './pages/Candidates';
import Voting from './pages/Voting';
import Results from './pages/Results';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminElections from './pages/AdminElections';
import AdminCandidates from './pages/AdminCandidates';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Voter Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } />
              <Route path="/elections" element={
                <ProtectedRoute>
                  <Elections />
                </ProtectedRoute>
              } />
              <Route path="/candidates/:electionId" element={
                <ProtectedRoute>
                  <Candidates />
                </ProtectedRoute>
              } />
              <Route path="/vote/:electionId" element={
                <ProtectedRoute>
                  <Voting />
                </ProtectedRoute>
              } />
              <Route path="/results/:electionId" element={
                <ProtectedRoute>
                  <Results />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute adminOnly={true}>
                  <Profile />
                </ProtectedRoute>
              } />

              {/* Admin Protected Routes */}
              <Route path="/admin" element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/elections" element={
                <ProtectedRoute adminOnly={true}>
                  <AdminElections />
                </ProtectedRoute>
              } />
              <Route path="/admin/candidates" element={
                <ProtectedRoute adminOnly={true}>
                  <AdminCandidates />
                </ProtectedRoute>
              } />

              {/* Fallbacks */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
