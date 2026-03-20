
export type Return = {
  id: string;
  productName: string;
  date: string;
  status: 'Accepted' | 'Pending' | 'Rejected' | 'Collected' | 'Recycled';
  points: number;
  type: 'Return' | 'Recycle';
  material?: string;
  imageUrl?: string;
};

export type Reward = {
  id: string;
  title: string;
  description: string;
  points: number;
  partner: string;
  icon: React.ComponentType<{ className?: string }>;
  url?: string;
};

export type Transaction = {
    id: string;
    description: string;
    points: number;
    date: string;
    type: 'credit' | 'debit';
}

export type Product = {
  id: string;
  name: string;
  description: string;
  pointsPrice: number;
  imageUrl: string;
  aiHint?: string;
  returnId?: string; // ID of the original return/recycle transaction
  originalPoints?: number; // Points awarded for the original return/recycle
}

export type Review = {
  id: string;
  name: string;
  rating: number;
  message: string;
  avatarUrl: string;
};

export type ComplaintStatus = 'Pending' | 'In Review' | 'Resolved';

export type Complaint = {
  id:string;
  location: string;
  imageUrl: string;
  timestamp: string;
  status: ComplaintStatus;
  description?: string;
  landmark?: string;
  resolutionDetails?: {
    policeName: string;
    firDocumentUrl?: string;
    digitalSignature: string;
    resolvedAt: string;
    verificationImageUrl?: string;
    submittedFrom?: string; // New field for location
  }
};
