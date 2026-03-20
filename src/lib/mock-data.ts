import type { Return, Reward, Transaction, Product, Review, Complaint } from './types';
import { Gift, TreePine, Utensils } from 'lucide-react';


// Mock data for user's green points
export const userGreenPoints = 1250;

// Mock data for returns history
export const mockReturns: Return[] = [
  { id: 'R001', productName: 'Plastic Bottle (1L)', date: '2023-10-26', status: 'Accepted', points: 10, type: 'Return', material: 'Plastic' },
  { id: 'R002', productName: 'Old Smartphone', date: '2023-10-24', status: 'Collected', points: 150, type: 'Return', material: 'Electronics' },
  { id: 'R003', productName: 'Cardboard Box', date: '2023-10-22', status: 'Recycled', points: 5, type: 'Recycle', material: 'Paper' },
  { id: 'R004', productName: 'Glass Jar', date: '2023-10-20', status: 'Pending', points: 8, type: 'Return', material: 'Glass' },
  { id: 'R005', productName: 'Aluminum Cans (x5)', date: '2023-10-18', status: 'Rejected', points: 0, type: 'Return', material: 'Metal' },
  { id: 'R006', productName: 'Newspaper Bundle', date: '2023-10-15', status: 'Recycled', points: 12, type: 'Recycle', material: 'Paper' },
  { id: 'R007', productName: 'E-Waste: Old Laptop', date: '2023-10-12', status: 'Pending', points: 250, type: 'Return', material: 'Electronics' },
];

// Mock data for rewards
export const mockRewards: Reward[] = [
  { id: 'RW01', title: '10% Off Groceries', description: 'At GreenMart.', points: 500, partner: 'GreenMart', icon: Gift, url: 'https://example.com/greenmart' },
  { id: 'RW02', title: 'Free Coffee', description: 'At The Eco Cafe.', points: 250, partner: 'The Eco Cafe', icon: Utensils, url: 'https://example.com/ecocafe' },
  { id: 'RW03', title: '$5 Voucher', description: 'At Sustainably Yours.', points: 750, partner: 'Sustainably Yours', icon: Gift, url: 'https://example.com/sustainably' },
  { id: 'RW04', title: 'Plant a Tree', description: 'In your name.', points: 1000, partner: 'One Tree Planted', icon: TreePine, url: 'https://example.com/onetreeplanted' },
];

// Mock data for wallet transactions
export const mockTransactions: Transaction[] = [
    { id: 'T001', description: 'Return: Plastic Bottle', date: '2023-10-26', points: 10, type: 'credit' },
    { id: 'T002', description: 'Return: Old Smartphone', date: '2023-10-24', points: 150, type: 'credit' },
    { id: 'T003', description: 'Redeemed: Free Coffee', date: '2023-10-23', points: 250, type: 'debit' },
    { id: 'T004', description: 'Recycled: Cardboard Box', date: '2023-10-22', points: 5, type: 'credit' },
    { id: 'T005', description: 'Recycled: Newspaper Bundle', date: '2023-10-15', points: 12, type: 'credit' },
]

// Mock data for products in the marketplace
export const mockProducts: Product[] = [
  {
    id: 'P001',
    name: 'Bamboo Toothbrush Set',
    description: 'Set of 4 biodegradable bamboo toothbrushes.',
    pointsPrice: 300,
    imageUrl: 'https://picsum.photos/400/301',
    aiHint: 'bamboo toothbrush'
  },
  {
    id: 'P002',
    name: 'Reusable Shopping Bag',
    description: 'Durable and foldable cotton shopping bag.',
    pointsPrice: 450,
    imageUrl: 'https://picsum.photos/400/302',
    aiHint: 'shopping bag'
  },
  {
    id: 'P003',
    name: 'Stainless Steel Water Bottle',
    description: '500ml insulated bottle to keep drinks hot or cold.',
    pointsPrice: 800,
    imageUrl: 'https://picsum.photos/400/303',
    aiHint: 'water bottle'
  },
  {
    id: 'P004',
    name: 'Recycled Paper Notebook',
    description: 'A5 notebook made from 100% recycled paper.',
    pointsPrice: 200,
    imageUrl: 'https://picsum.photos/400/304',
    aiHint: 'recycled notebook',
    returnId: 'R003', // Example of a user-added item
    originalPoints: 5
  },
   {
    id: 'P005',
    name: 'Solar-Powered Charger',
    description: 'Portable charger for your devices, powered by the sun.',
    pointsPrice: 1500,
    imageUrl: 'https://picsum.photos/400/305',
    aiHint: 'solar charger'
  },
  {
    id: 'P006',
    name: 'Compost Bin',
    description: 'Small kitchen compost bin for food scraps.',
    pointsPrice: 1200,
    imageUrl: 'https://picsum.photos/400/306',
    aiHint: 'compost bin'
  },
];

// Mock data for reviews
export const mockReviews: Review[] = [
    {
        id: 'REV001',
        name: 'Anjali Sharma',
        rating: 5,
        message: 'SafaiSetu has completely changed how my family handles waste. The rewards are a fantastic bonus!',
        avatarUrl: 'https://picsum.photos/seed/Anjali/100',
    },
    {
        id: 'REV002',
        name: 'Rajesh Kumar',
        rating: 4,
        message: 'A great initiative for a cleaner city. The app is easy to use and the smart bin feature is very innovative.',
        avatarUrl: 'https://picsum.photos/seed/Rajesh/100',
    },
    {
        id: 'REV003',
        name: 'Priya Mehta',
        rating: 5,
        message: 'I love that I can earn points for recycling. It makes me feel like my efforts are being recognized.',
        avatarUrl: 'https://picsum.photos/seed/Priya/100',
    },
]

// Mock data for complaints
export const mockComplaints: Complaint[] = [
    {
        id: 'COMP001',
        location: 'Near Jagraon Bridge, Ludhiana',
        imageUrl: 'https://picsum.photos/seed/burning1/400/300',
        timestamp: '2024-07-31 18:30',
        status: 'Pending',
        description: 'Large field being set on fire.'
    },
    {
        id: 'COMP002',
        location: 'Lat: 30.88, Lng: 75.82',
        imageUrl: 'https://picsum.photos/seed/burning2/400/300',
        timestamp: '2024-07-30 20:00',
        status: 'In Review',
        description: 'Smoke visible from the highway.'
    },
    {
        id: 'COMP003',
        location: 'Samrala Chowk',
        imageUrl: 'https://picsum.photos/seed/burning3/400/300',
        timestamp: '2024-07-29 12:15',
        status: 'Resolved',
        description: 'Action was taken by local authorities.'
    }
];
