import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { Family, User } from '../types';
import { useAuth } from './AuthContext';

interface FamilyContextType {
  family: Family | null;
  familyMembers: User[];
  loading: boolean;
  createFamily: (nome: string) => Promise<void>;
  joinFamily: (familyId: string) => Promise<void>;
  loadFamily: () => Promise<void>;
}

const FamilyContext = createContext<FamilyContextType>({} as FamilyContextType);

export const useFamily = () => {
  return useContext(FamilyContext);
};

export const FamilyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, userData, updateUserData } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [familyMembers, setFamilyMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const createFamily = async (nome: string) => {
    if (!currentUser) throw new Error('Usuário não autenticado');

    const familyId = `family_${currentUser.uid}_${Date.now()}`;
    
    // Cria a família
    await setDoc(doc(db, 'families', familyId), {
      id: familyId,
      nome: nome,
      createdBy: currentUser.uid,
      createdAt: new Date(),
      members: [currentUser.uid]
    });

    // Atualiza o usuário com o familyId
    await updateDoc(doc(db, 'users', currentUser.uid), {
      familyId: familyId
    });

    await updateUserData();
    await loadFamily();
  };

  const joinFamily = async (familyId: string) => {
    if (!currentUser) throw new Error('Usuário não autenticado');

    // Verifica se a família existe
    const familyDoc = await getDoc(doc(db, 'families', familyId));
    if (!familyDoc.exists()) {
      throw new Error('Família não encontrada');
    }

    // Adiciona o usuário aos membros da família
    await updateDoc(doc(db, 'families', familyId), {
      members: arrayUnion(currentUser.uid)
    });

    // Atualiza o usuário com o familyId
    await updateDoc(doc(db, 'users', currentUser.uid), {
      familyId: familyId
    });

    await updateUserData();
    await loadFamily();
  };

  const loadFamily = async () => {
    if (!userData?.familyId) {
      setFamily(null);
      setFamilyMembers([]);
      return;
    }

    setLoading(true);
    try {
      // Carrega dados da família
      const familyDoc = await getDoc(doc(db, 'families', userData.familyId));
      if (familyDoc.exists()) {
        const familyData = {
          ...familyDoc.data(),
          createdAt: familyDoc.data().createdAt.toDate()
        } as Family;
        setFamily(familyData);

        // Carrega dados dos membros
        const membersQuery = query(
          collection(db, 'users'),
          where('familyId', '==', userData.familyId)
        );
        const membersSnapshot = await getDocs(membersQuery);
        const members = membersSnapshot.docs.map(doc => doc.data() as User);
        setFamilyMembers(members);
      }
    } catch (error) {
      console.error('Erro ao carregar família:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData) {
      loadFamily();
    }
  }, [userData]);

  const value = {
    family,
    familyMembers,
    loading,
    createFamily,
    joinFamily,
    loadFamily
  };

  return (
    <FamilyContext.Provider value={value}>
      {children}
    </FamilyContext.Provider>
  );
};

