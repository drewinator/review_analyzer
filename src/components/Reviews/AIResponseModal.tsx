import React, { useState, useEffect } from 'react';
import { X, Sparkles, Send, Save, AlertCircle } from 'lucide-react';
import { generateAIResponse, saveResponse } from '../../services/responseService';
import { getResponseTemplates } from '../../services/templateService';
import { Review } from '../../types';

interface AIResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: Review;
  onResponseGenerated: () => void;
}

type ResponseTone = 'PROFESSIONAL' | 'FRIENDLY' | 'APOLOGETIC' | 'GRATEFUL';

interface ResponseTemplate {
  id: string;
  title: string;
  content: string;
  tone: ResponseTone;
  category: string;
}

const toneDescriptions: Record<ResponseTone, string> = {
  PROFESSIONAL: 'Formal, courteous, and business-appropriate',
  FRIENDLY: 'Warm, conversational, and personable',
  APOLOGETIC: 'Understanding and genuinely concerned',
  GRATEFUL: 'Appreciative and thankful for feedback',
};

export const AIResponseModal: React.FC<AIResponseModalProps> = ({
  isOpen,
  onClose,
  review,
  onResponseGenerated,
}) => {
  const [tone, setTone] = useState<ResponseTone>('PROFESSIONAL');
  const [customInstructions, setCustomInstructions] = useState('');
  const [generatedResponse, setGeneratedResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [templates, setTemplates] = useState<ResponseTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [useGPT4, setUseGPT4] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    try {
      const data = await getResponseTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setGeneratedResponse(
        interpolateTemplate(template.content, {
          customer_name: review.authorName,
          restaurant_name: review.restaurant?.name || 'our restaurant',
          rating: review.rating.toString(),
        })
      );
      setTone(template.tone);
    }
  };

  const interpolateTemplate = (
    template: string,
    variables: Record<string, string>
  ): string => {
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, value);
    });
    return result;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const response = await generateAIResponse(review.id, {
        tone,
        customInstructions,
        useGPT4,
      });
      setGeneratedResponse(response.content);
    } catch (error: any) {
      setError(error.message || 'Failed to generate response');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedResponse.trim()) {
      setError('Response cannot be empty');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      await saveResponse(review.id, {
        content: generatedResponse,
        tone,
        isAIGenerated: true,
        model: useGPT4 ? 'gpt-4-turbo-preview' : 'gpt-3.5-turbo',
      });
      onResponseGenerated();
      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to save response');
    } finally {
      setIsSaving(false);
    }
  };

  const characterCount = generatedResponse.length;
  const isOverLimit = characterCount > 500;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold">Generate AI Response</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Review Details */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium">{review.authorName}</h3>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-sm ${
                      i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            <p className="text-gray-700">{review.content}</p>
          </div>

          {/* Tone Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Response Tone
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(toneDescriptions) as ResponseTone[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    tone === t
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-medium capitalize">
                      {t.toLowerCase()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {toneDescriptions[t]}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Template Selection */}
          {templates.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response Template (Optional)
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select a template...</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.title} ({template.category})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Custom Instructions */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Instructions (Optional)
            </label>
            <textarea
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="Add any specific instructions for the AI..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Model Selection */}
          <div className="mb-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={useGPT4}
                onChange={(e) => setUseGPT4(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Use GPT-4 (Better quality, slower)
              </span>
            </label>
          </div>

          {/* Generate Button */}
          {!generatedResponse && (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full mb-6 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Response
                </>
              )}
            </button>
          )}

          {/* Generated Response */}
          {generatedResponse && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Generated Response
                </label>
                <div
                  className={`text-sm ${
                    isOverLimit ? 'text-red-600' : 'text-gray-500'
                  }`}
                >
                  {characterCount}/500 characters
                </div>
              </div>
              <textarea
                value={generatedResponse}
                onChange={(e) => setGeneratedResponse(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
                  isOverLimit ? 'border-red-300' : 'border-gray-300'
                }`}
                rows={6}
              />
              {isOverLimit && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Response exceeds Google's 500 character limit
                </p>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          {generatedResponse && (
            <>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Regenerate
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || isOverLimit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Response
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};