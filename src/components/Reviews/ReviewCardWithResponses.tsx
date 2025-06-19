import React, { useState } from 'react';
import { Review } from '../../types';
import ReviewCard from './ReviewCard';
import { ResponseHistory } from './ResponseHistory';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ReviewCardWithResponsesProps {
  review: Review;
  onReply?: (review: Review) => void;
  onUpdateStatus?: (reviewId: string, status: string) => void;
  onRefresh?: () => void;
}

export const ReviewCardWithResponses: React.FC<ReviewCardWithResponsesProps> = ({
  review,
  onReply,
  onUpdateStatus,
  onRefresh,
}) => {
  const [showResponses, setShowResponses] = useState(false);

  return (
    <div className="space-y-2">
      <ReviewCard
        review={review}
        onReply={onReply}
        onUpdateStatus={onUpdateStatus}
      />
      
      {(review.responses && review.responses.length > 0) || review.status === 'RESPONDED' ? (
        <div className="ml-12">
          <button
            onClick={() => setShowResponses(!showResponses)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            {showResponses ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            {showResponses ? 'Hide' : 'Show'} Response History
          </button>
          
          {showResponses && (
            <div className="mt-2 bg-white rounded-lg border border-gray-200 p-4">
              <ResponseHistory reviewId={review.id} onRefresh={onRefresh} />
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};