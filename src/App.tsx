import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { FamilyProvider } from './contexts/FamilyContext';
import PrivateRoute from './components/PrivateRoute';
import FamilyGuard from './components/FamilyGuard';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Incomes from './pages/Incomes';
import Expenses from './pages/Expenses';
import Family from './pages/Family';
import Profile from './pages/Profile';
import FamilySetup from './pages/FamilySetup';
import SavingsGoal from './pages/SavingsGoal';

function App() {
  return (
    <Router>
      <AuthProvider>
        <FamilyProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route
              path="/familia/setup"
              element={
                <PrivateRoute>
                  <FamilySetup />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <FamilyGuard>
                    <Dashboard />
                  </FamilyGuard>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/rendimentos"
              element={
                <PrivateRoute>
                  <FamilyGuard>
                    <Incomes />
                  </FamilyGuard>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/gastos"
              element={
                <PrivateRoute>
                  <FamilyGuard>
                    <Expenses />
                  </FamilyGuard>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/familia"
              element={
                <PrivateRoute>
                  <FamilyGuard>
                    <Family />
                  </FamilyGuard>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/meta"
              element={
                <PrivateRoute>
                  <FamilyGuard>
                    <SavingsGoal />
                  </FamilyGuard>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/perfil"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </FamilyProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

