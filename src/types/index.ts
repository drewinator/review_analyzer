export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MANAGER' | 'VIEWER';
  createdAt: string;
  updatedAt: string;
}

export interface SimpleReview {
  id: string;
  rating: number;
  content?: string;
  authorName: string;
  publishedAt: string;
}

export interface Restaurant {
  id: string;
  name: string;
  googleId: string;
  address: string;
  phoneNumber?: string;
  website?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  reviews?: SimpleReview[];
}

export interface Review {
  id: string;
  googleId: string;
  rating: number;
  content?: string;
  authorName: string;
  authorUrl?: string;
  profilePhoto?: string;
  publishedAt: string;
  restaurantId: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  sentimentScore?: number;
  keywords?: string[];
  status: 'PENDING' | 'RESPONDED' | 'IGNORED';
  createdAt: string;
  updatedAt: string;
  restaurant?: Restaurant;
  responses?: Response[];
}

export interface Response {
  id: string;
  content: string;
  tone: 'PROFESSIONAL' | 'FRIENDLY' | 'APOLOGETIC' | 'GRATEFUL';
  reviewId: string;
  userId: string;
  isPosted: boolean;
  postedAt?: string;
  isAIGenerated: boolean;
  model?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}