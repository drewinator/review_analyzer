import React from 'react';
import { Review } from '../../types';
import { Star, MessageSquare, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

interface ReviewCardProps {
  review: Review;
  onReply?: (review: Review) => void;
  onUpdateStatus?: (reviewId: string, status: string) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onReply, onUpdateStatus }) => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE':
        return 'bg-green-100 text-green-800';
      case 'NEGATIVE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESPONDED':
        return 'bg-blue-100 text-blue-800';
      case 'IGNORED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {review.profilePhoto ? (
            <img
              src={review.profilePhoto}
              alt={review.authorName}
              className="h-10 w-10 rounded-full"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-6 w-6 text-gray-500" />
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-gray-900">{review.authorName}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex items-center space-x-1">
                {renderStars(review.rating)}
              </div>
              <span className="text-sm text-gray-500">
                {format(new Date(review.publishedAt), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSentimentColor(review.sentiment)}`}>
            {review.sentiment}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
            {review.status}
          </span>
        </div>
      </div>

      {review.text && (
        <p className="text-gray-700 mb-4 leading-relaxed">{review.text}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{review.restaurant.name}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {review.responses.length > 0 && (
            <span className="inline-flex items-center text-sm text-gray-500">
              <MessageSquare className="h-4 w-4 mr-1" />
              {review.responses.length} response{review.responses.length !== 1 ? 's' : ''}
            </span>
          )}
          
          {onReply && review.status === 'PENDING' && (
            <button
              onClick={() => onReply(review)}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Reply
            </button>
          )}
          
          {onUpdateStatus && (
            <select
              value={review.status}
              onChange={(e) => onUpdateStatus(review.id, e.target.value)}
              className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="PENDING">Pending</option>
              <option value="RESPONDED">Responded</option>
              <option value="IGNORED">Ignored</option>
            </select>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;