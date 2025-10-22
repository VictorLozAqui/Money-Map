import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface FamilyGuardProps {
  children: React.ReactNode;
}

const FamilyGuard: React.FC<FamilyGuardProps> = ({ children }) => {
  const { userData } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userData && !userData.familyId) {
      navigate('/familia/setup');
    }
  }, [userData, navigate]);

  return <>{children}</>;
};

export default FamilyGuard;

