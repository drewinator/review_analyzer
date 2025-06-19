import axios from 'axios';
import { getAuthHeader } from '../utils/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export interface ResponseTemplate {
  id: string;
  title: string;
  content: string;
  tone: 'PROFESSIONAL' | 'FRIENDLY' | 'APOLOGETIC' | 'GRATEFUL';
  category: string;
  variables?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateDto {
  title: string;
  content: string;
  tone: 'PROFESSIONAL' | 'FRIENDLY' | 'APOLOGETIC' | 'GRATEFUL';
  category: string;
  variables?: string[];
}

export const getResponseTemplates = async (filters?: {
  tone?: string;
  category?: string;
  isActive?: boolean;
}): Promise<ResponseTemplate[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.tone) params.append('tone', filters.tone);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());

    const response = await axios.get(
      `${API_URL}/responses/templates${params.toString() ? `?${params.toString()}` : ''}`,
      { headers: getAuthHeader() }
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch templates');
  }
};

export const createResponseTemplate = async (
  data: CreateTemplateDto
): Promise<ResponseTemplate> => {
  try {
    const response = await axios.post(
      `${API_URL}/responses/templates`,
      data,
      { headers: getAuthHeader() }
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to create template');
  }
};

export const updateResponseTemplate = async (
  templateId: string,
  data: Partial<CreateTemplateDto>
): Promise<ResponseTemplate> => {
  try {
    const response = await axios.put(
      `${API_URL}/responses/templates/${templateId}`,
      data,
      { headers: getAuthHeader() }
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to update template');
  }
};

export const deleteResponseTemplate = async (templateId: string): Promise<void> => {
  try {
    await axios.delete(
      `${API_URL}/responses/templates/${templateId}`,
      { headers: getAuthHeader() }
    );
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to delete template');
  }
};