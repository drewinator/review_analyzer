import axios from 'axios';
import { getAuthHeader } from '../utils/auth';
import { Response } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export interface GenerateResponseDto {
  tone: 'PROFESSIONAL' | 'FRIENDLY' | 'APOLOGETIC' | 'GRATEFUL';
  customInstructions?: string;
  useGPT4?: boolean;
}

export interface SaveResponseDto {
  content: string;
  tone: 'PROFESSIONAL' | 'FRIENDLY' | 'APOLOGETIC' | 'GRATEFUL';
  isAIGenerated?: boolean;
  model?: string;
}

export const generateAIResponse = async (
  reviewId: string,
  data: GenerateResponseDto
): Promise<Response> => {
  try {
    const response = await axios.post(
      `${API_URL}/responses/reviews/${reviewId}/generate`,
      data,
      { headers: getAuthHeader() }
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to generate response');
  }
};

export const saveResponse = async (
  reviewId: string,
  data: SaveResponseDto
): Promise<Response> => {
  try {
    const response = await axios.post(
      `${API_URL}/responses/reviews/${reviewId}/responses`,
      data,
      { headers: getAuthHeader() }
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to save response');
  }
};

export const getResponsesByReview = async (reviewId: string): Promise<Response[]> => {
  try {
    const response = await axios.get(
      `${API_URL}/responses/reviews/${reviewId}`,
      { headers: getAuthHeader() }
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch responses');
  }
};

export const updateResponse = async (
  responseId: string,
  data: { content?: string; tone?: string }
): Promise<Response> => {
  try {
    const response = await axios.put(
      `${API_URL}/responses/${responseId}`,
      data,
      { headers: getAuthHeader() }
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to update response');
  }
};

export const markResponseAsPosted = async (responseId: string): Promise<Response> => {
  try {
    const response = await axios.post(
      `${API_URL}/responses/${responseId}/post`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to mark response as posted');
  }
};

export const deleteResponse = async (responseId: string): Promise<void> => {
  try {
    await axios.delete(
      `${API_URL}/responses/${responseId}`,
      { headers: getAuthHeader() }
    );
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to delete response');
  }
};