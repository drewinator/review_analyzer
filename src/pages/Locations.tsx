import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Star, Upload, Link } from 'lucide-react';
import { Restaurant } from '../types';
import { restaurantAPI, googleAPI } from '../services/api';

interface LocationsProps {}

const Locations: React.FC<LocationsProps> = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phoneNumber: '',
    website: '',
    googlePlaceId: '',
  });

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const data = await restaurantAPI.getRestaurants();
      setRestaurants(data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newRestaurant = await restaurantAPI.createRestaurant(formData);
      setRestaurants([...restaurants, newRestaurant]);
      setFormData({ name: '', address: '', phoneNumber: '', website: '', googlePlaceId: '' });
      setShowAddForm(false);
    } catch (error: any) {
      console.error('Error creating restaurant:', error);
      alert(error.response?.data?.error || 'Failed to create restaurant');
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const { authUrl } = await googleAPI.getAuthUrl();
      window.location.href = authUrl;
    } catch (error: any) {
      console.error('Error getting Google auth URL:', error);
      alert('Failed to initiate Google authentication');
    }
  };

  const handleImportReviews = async (restaurantId: string) => {
    try {
      const result = await restaurantAPI.importReviews(restaurantId);
      alert(result.message);
      fetchRestaurants(); // Refresh the list
    } catch (error: any) {
      console.error('Error importing reviews:', error);
      
      if (error.response?.data?.needsGoogleAuth) {
        const shouldConnect = window.confirm(
          'You need to connect your Google Business account to import reviews. Would you like to connect now?'
        );
        if (shouldConnect) {
          handleConnectGoogle();
        }
      } else {
        alert(error.response?.data?.error || 'Failed to import reviews');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading locations...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Restaurant Locations</h1>
          <p className="text-gray-600">Manage your restaurant locations and import reviews</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleConnectGoogle}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Link className="h-4 w-4 mr-2" />
            Connect Google Business
          </button>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </button>
        </div>
      </div>

      {/* Add Restaurant Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Restaurant</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="googlePlaceId" className="block text-sm font-medium text-gray-700">
                Google Place ID (optional)
              </label>
              <input
                type="text"
                id="googlePlaceId"
                name="googlePlaceId"
                value={formData.googlePlaceId}
                onChange={handleChange}
                placeholder="e.g., ChIJN1t_tDeuEmsRUsoyG83frY4"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <p className="mt-1 text-sm text-gray-500">
                Find your Google Place ID at{' '}
                <a href="https://developers.google.com/maps/documentation/places/web-service/place-id" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">
                  Google's Place ID Finder
                </a>
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Restaurant
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Restaurant List */}
      <div className="space-y-6">
        {restaurants.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <MapPin className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No restaurants added</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first restaurant location.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Restaurant
              </button>
            </div>
          </div>
        ) : (
          restaurants.map((restaurant) => (
            <div key={restaurant.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{restaurant.name}</h3>
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {restaurant.address}
                  </div>
                  {restaurant.phoneNumber && (
                    <div className="mt-1 text-sm text-gray-500">
                      Phone: {restaurant.phoneNumber}
                    </div>
                  )}
                  {restaurant.website && (
                    <div className="mt-1 text-sm text-gray-500">
                      Website: <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">{restaurant.website}</a>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  {restaurant.reviews && restaurant.reviews.length > 0 && (
                    <div className="text-center">
                      <div className="flex items-center text-yellow-400">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="ml-1 text-sm font-medium text-gray-900">
                          {(restaurant.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / restaurant.reviews.length).toFixed(1)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {restaurant.reviews.length} review{restaurant.reviews.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleImportReviews(restaurant.id)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Import Reviews
                    </button>
                  </div>
                </div>
              </div>
              
              {restaurant.reviews && restaurant.reviews.length > 0 && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Reviews</h4>
                  <div className="space-y-2">
                    {restaurant.reviews.slice(0, 3).map((review: any) => (
                      <div key={review.id} className="text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {Array.from({ length: review.rating }, (_, i) => (
                              <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                            ))}
                          </div>
                          <span className="font-medium text-gray-900">{review.authorName}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-500">
                            {new Date(review.publishedAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.text && (
                          <p className="mt-1 text-gray-600 line-clamp-2">{review.text}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Locations;