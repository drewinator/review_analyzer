import React, { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';
import { restaurantAPI } from '../../services/api';

interface ManualReviewFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ManualReviewForm: React.FC<ManualReviewFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    restaurantId: '',
    rating: 5,
    text: '',
    authorName: '',
    publishedAt: new Date().toISOString().split('T')[0], // Today's date
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRestaurants();
    }
  }, [isOpen]);

  const fetchRestaurants = async () => {
    try {
      const data = await restaurantAPI.getRestaurants();
      setRestaurants(data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await restaurantAPI.addManualReview(formData);
      alert('Review added successfully!');
      setFormData({
        restaurantId: '',
        rating: 5,
        text: '',
        authorName: '',
        publishedAt: new Date().toISOString().split('T')[0],
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error adding review:', error);
      alert(error.response?.data?.error || 'Failed to add review');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'rating' ? parseInt(value) : value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Add Manual Review</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="restaurantId" className="block text-sm font-medium text-gray-700">
              Restaurant *
            </label>
            <select
              id="restaurantId"
              name="restaurantId"
              required
              value={formData.restaurantId}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Select a restaurant</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="authorName" className="block text-sm font-medium text-gray-700">
              Author Name *
            </label>
            <input
              type="text"
              id="authorName"
              name="authorName"
              required
              value={formData.authorName}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., John Smith"
            />
          </div>

          <div>
            <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
              Rating *
            </label>
            <div className="mt-1 flex items-center space-x-2">
              <select
                id="rating"
                name="rating"
                required
                value={formData.rating}
                onChange={handleChange}
                className="block border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value={1}>1 Star</option>
                <option value={2}>2 Stars</option>
                <option value={3}>3 Stars</option>
                <option value={4}>4 Stars</option>
                <option value={5}>5 Stars</option>
              </select>
              <div className="flex items-center">
                {Array.from({ length: formData.rating }, (_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
                {Array.from({ length: 5 - formData.rating }, (_, i) => (
                  <Star key={i + formData.rating} className="h-4 w-4 text-gray-300" />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700">
              Review Text
            </label>
            <textarea
              id="text"
              name="text"
              rows={4}
              value={formData.text}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter the review text..."
            />
          </div>

          <div>
            <label htmlFor="publishedAt" className="block text-sm font-medium text-gray-700">
              Review Date
            </label>
            <input
              type="date"
              id="publishedAt"
              name="publishedAt"
              value={formData.publishedAt}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualReviewForm;