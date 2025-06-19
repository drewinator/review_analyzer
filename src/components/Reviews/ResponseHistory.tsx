import React, { useState, useEffect } from 'react';
import { Response } from '../../types';
import { getResponsesByReview, markResponseAsPosted, deleteResponse } from '../../services/responseService';
import { MessageSquare, Send, Trash2, Edit2, CheckCircle, Clock, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

interface ResponseHistoryProps {
  reviewId: string;
  onRefresh?: () => void;
}

export const ResponseHistory: React.FC<ResponseHistoryProps> = ({ reviewId, onRefresh }) => {
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingResponseId, setEditingResponseId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    loadResponses();
  }, [reviewId]);

  const loadResponses = async () => {
    try {
      setLoading(true);
      const data = await getResponsesByReview(reviewId);
      setResponses(data.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load responses');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPosted = async (responseId: string) => {
    try {
      await markResponseAsPosted(responseId);
      await loadResponses();
      onRefresh?.();
    } catch (err: any) {
      setError(err.message || 'Failed to mark response as posted');
    }
  };

  const handleDelete = async (responseId: string) => {
    if (!window.confirm('Are you sure you want to delete this response?')) {
      return;
    }

    try {
      await deleteResponse(responseId);
      await loadResponses();
    } catch (err: any) {
      setError(err.message || 'Failed to delete response');
    }
  };

  const getToneLabel = (tone: string) => {
    return tone.charAt(0) + tone.slice(1).toLowerCase();
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'PROFESSIONAL':
        return 'bg-blue-100 text-blue-800';
      case 'FRIENDLY':
        return 'bg-green-100 text-green-800';
      case 'APOLOGETIC':
        return 'bg-orange-100 text-orange-800';
      case 'GRATEFUL':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        {error}
      </div>
    );
  }

  if (responses.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No responses yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {responses.map((response) => (
        <div key={response.id} className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {response.isAIGenerated && (
                <Sparkles className="w-4 h-4 text-purple-600" />
              )}
              <span className="text-sm font-medium">
                {response.user?.firstName} {response.user?.lastName}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${getToneColor(response.tone)}`}>
                {getToneLabel(response.tone)}
              </span>
              {response.isPosted ? (
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle className="w-3 h-3" />
                  Posted
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  Draft
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500">
              {format(new Date(response.createdAt), 'MMM d, yyyy h:mm a')}
            </span>
          </div>

          <div className="mb-3">
            {editingResponseId === response.id ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
              />
            ) : (
              <p className="text-gray-700">{response.content}</p>
            )}
          </div>

          {response.isAIGenerated && response.model && (
            <p className="text-xs text-gray-500 mb-2">
              Generated using {response.model}
            </p>
          )}

          <div className="flex items-center gap-2">
            {!response.isPosted && (
              <>
                <button
                  onClick={() => handleMarkAsPosted(response.id)}
                  className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                >
                  <Send className="w-4 h-4" />
                  Mark as Posted
                </button>
                <button
                  onClick={() => {
                    setEditingResponseId(response.id);
                    setEditContent(response.content);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              </>
            )}
            <button
              onClick={() => handleDelete(response.id)}
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};