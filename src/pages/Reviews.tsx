import React, { useState, useEffect } from 'react';
import { Review } from '../types';
import ReviewCard from '../components/Reviews/ReviewCard';
import ReviewFilters from '../components/Reviews/ReviewFilters';
import ManualReviewForm from '../components/Reviews/ManualReviewForm';
import { reviewAPI } from '../services/api';
import { Loader2, Plus } from 'lucide-react';

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showManualForm, setShowManualForm] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    rating: '',
    sentiment: '',
    status: '',
    dateRange: '',
  });

  useEffect(() => {
    fetchReviews();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewAPI.getReviews(undefined, filters);
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleUpdateStatus = async (reviewId: string, status: string) => {
    try {
      await reviewAPI.updateReviewStatus(reviewId, status);
      setReviews(prev =>
        prev.map(review =>
          review.id === reviewId ? { ...review, status: status as any } : review
        )
      );
    } catch (error) {
      console.error('Error updating review status:', error);
    }
  };

  const handleReply = (review: Review) => {
    // TODO: Implement reply modal
    console.log('Reply to review:', review.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-600">Manage and respond to customer reviews</p>
        </div>
        
        <button
          onClick={() => setShowManualForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Review
        </button>
      </div>

      <ReviewFilters filters={filters} onFilterChange={handleFilterChange} />

      <ManualReviewForm
        isOpen={showManualForm}
        onClose={() => setShowManualForm(false)}
        onSuccess={fetchReviews}
      />

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No reviews found matching your criteria.</p>
          </div>
        ) : (
          reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onReply={handleReply}
              onUpdateStatus={handleUpdateStatus}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Reviews;