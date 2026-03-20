
'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import {Return, Transaction, Product, Review, Complaint, ComplaintStatus} from '@/lib/types';
import {
  mockReturns,
  mockTransactions,
  userGreenPoints as initialGreenPoints,
  mockProducts,
  mockReviews,
  mockComplaints,
} from '@/lib/mock-data';

interface AppContextType {
  returns: Return[];
  transactions: Transaction[];
  greenPoints: number;
  products: Product[];
  reviews: Review[];
  complaints: Complaint[];
  addReturn: (newReturn: Return, pointsPrice?: number) => void;
  addTransaction: (newTransaction: Transaction) => void;
  addReview: (newReview: Review) => void;
  addComplaint: (newComplaint: Omit<Complaint, 'id' | 'status' | 'timestamp' | 'resolutionDetails'>) => void;
  updateComplaintStatus: (complaintId: string, status: ComplaintStatus, resolutionDetails?: Complaint['resolutionDetails']) => void;
  deleteComplaint: (complaintId: string) => void;
  deleteProduct: (product: Product) => void;
  isInitialized: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to get data from localStorage
function getFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }
  try {
    const item = window.localStorage.getItem(key);
    // If the key doesn't exist, we return the fallback.
    if (item === null) return fallback;
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error reading from localStorage for key "${key}":`, error);
    return fallback;
  }
};

// Helper to save data to localStorage
function saveToStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage for key "${key}":`, error);
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
       alert('Storage quota exceeded! Some data may not be saved. Please clear some items to free up space.');
    }
  }
};


export const AppProvider = ({children}: {children: ReactNode}) => {
  const [returns, setReturns] = useState<Return[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [greenPoints, setGreenPoints] = useState<number>(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setReturns(getFromStorage('returns', mockReturns));
    setTransactions(getFromStorage('transactions', mockTransactions));
    setGreenPoints(getFromStorage('greenPoints', initialGreenPoints));
    setProducts(getFromStorage('products', mockProducts));
    setReviews(getFromStorage('reviews', mockReviews));
    setComplaints(getFromStorage('complaints', mockComplaints));
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      saveToStorage('returns', returns);
    }
  }, [returns, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      saveToStorage('transactions', transactions);
    }
  }, [transactions, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      saveToStorage('greenPoints', greenPoints);
    }
  }, [greenPoints, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      saveToStorage('products', products);
    }
  }, [products, isInitialized]);
  
  useEffect(() => {
    if (isInitialized) {
      saveToStorage('reviews', reviews);
    }
  }, [reviews, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      saveToStorage('complaints', complaints);
    }
  }, [complaints, isInitialized]);

  const truncateDataUri = (uri: string | undefined) => {
    if (!uri) return undefined;
    // Do not truncate the URI to prevent image corruption.
    // The browser's localStorage quota will be handled by the saveToStorage function.
    return uri;
  };

  const addReturn = (newReturn: Return, pointsPrice?: number) => {
    const returnWithTruncatedImage = {
        ...newReturn,
        imageUrl: truncateDataUri(newReturn.imageUrl),
    };
    
    setReturns(prev => [returnWithTruncatedImage, ...prev]);

    // Add to marketplace if it has a price
    if(pointsPrice && pointsPrice > 0) {
      const newProduct: Product = {
        id: `P${Date.now()}`,
        name: newReturn.productName,
        description: `A ${newReturn.type === 'Recycle' ? 'recycled' : 'returned'} item. Material: ${newReturn.material || 'N/A'}`,
        pointsPrice: pointsPrice,
        imageUrl: returnWithTruncatedImage.imageUrl || 'https://picsum.photos/400/300',
        aiHint: newReturn.material?.toLowerCase() || 'recycled item',
        returnId: newReturn.id,
        originalPoints: newReturn.points
      };
      setProducts(prev => [newProduct, ...prev]);
    }
    
    if (newReturn.points > 0) {
      addTransaction({
        id: `T${Date.now()}`,
        description: `${newReturn.type}: ${newReturn.productName}`,
        points: newReturn.points,
        date: newReturn.date,
        type: 'credit',
      });
    }
  };

  const addTransaction = (newTransaction: Transaction) => {
    setTransactions(prev => [newTransaction, ...prev]);
    setGreenPoints(prev => {
        if (newTransaction.type === 'credit') {
            return prev + newTransaction.points;
        } else {
            return prev - newTransaction.points;
        }
    });
  };
  
  const addReview = (newReview: Review) => {
    setReviews(prev => [newReview, ...prev]);
  };
  
  const addComplaint = (newComplaintData: Omit<Complaint, 'id' | 'status' | 'timestamp' | 'resolutionDetails'>) => {
    const newComplaint: Complaint = {
      ...newComplaintData,
      id: `COMP${Date.now()}`,
      status: 'Pending',
      timestamp: new Date().toLocaleString('en-IN'),
      imageUrl: truncateDataUri(newComplaintData.imageUrl) || '',
    };
    setComplaints(prev => [newComplaint, ...prev]);
  };

  const updateComplaintStatus = (complaintId: string, status: ComplaintStatus, resolutionDetails?: Complaint['resolutionDetails']) => {
    setComplaints(prev => prev.map(c => 
      c.id === complaintId 
        ? { 
            ...c, 
            status, 
            resolutionDetails: resolutionDetails ? {
              ...resolutionDetails,
              verificationImageUrl: truncateDataUri(resolutionDetails.verificationImageUrl)
            } : c.resolutionDetails
          } 
        : c
    ));
  };

  const deleteComplaint = (complaintId: string) => {
    setComplaints(prev => prev.filter(c => c.id !== complaintId));
  };

  const deleteProduct = (productToDelete: Product) => {
    if (!productToDelete) return;
    
    // Deduct points if originalPoints is available
    if (productToDelete.originalPoints && productToDelete.originalPoints > 0) {
      addTransaction({
          id: `T${Date.now()}`,
          description: `Marketplace item removed: ${productToDelete.name}`,
          points: productToDelete.originalPoints,
          date: new Date().toLocaleDateString('en-US'),
          type: 'debit',
      });
    }

    // Remove the product from the marketplace
    setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
    
    // Also remove the original return item from history to prevent re-adding
    if(productToDelete.returnId) {
      setReturns(prev => prev.filter(r => r.id !== productToDelete.returnId));
    }
  };


  return (
    <AppContext.Provider
      value={{returns, transactions, greenPoints, products, reviews, complaints, addReturn, addTransaction, addReview, addComplaint, updateComplaintStatus, deleteComplaint, deleteProduct, isInitialized}}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
