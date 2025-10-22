import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useFamily } from './FamilyContext';
import toast from 'react-hot-toast';

export interface CustomCategory {
  id: string;
  name: string;
  familyId: string;
  createdBy: string;
  createdAt: Date;
}

interface CategoryContextType {
  categories: string[];
  customCategories: CustomCategory[];
  addCategory: (name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const defaultCategories = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Saúde',
  'Educação',
  'Lazer',
  'Outros'
];

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const { family } = useFamily();

  useEffect(() => {
    if (!family) {
      setCustomCategories([]);
      return;
    }

    const q = query(
      collection(db, 'categories'),
      where('familyId', '==', family.id)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const cats = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        })) as CustomCategory[];
        setCustomCategories(cats);
      },
      (error) => {
        console.error('Erro ao carregar categorias:', error);
        setCustomCategories([]);
      }
    );

    return () => unsubscribe();
  }, [family]);

  const categories = [
    ...defaultCategories,
    ...customCategories.map(c => c.name)
  ];

  const addCategory = async (name: string) => {
    if (!family) return;
    
    try {
      await addDoc(collection(db, 'categories'), {
        name,
        familyId: family.id,
        createdBy: family.members[0],
        createdAt: new Date()
      });
      toast.success('Categoria adicionada!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao adicionar categoria');
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
      toast.success('Categoria removida!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao remover categoria');
    }
  };

  return (
    <CategoryContext.Provider value={{ categories, customCategories, addCategory, deleteCategory }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};

