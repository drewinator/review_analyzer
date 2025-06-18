import React, { useState, useEffect } from 'react';
import { reviewAPI } from '../services/api';
import MetricCard from '../components/Analytics/MetricCard';
import SentimentChart from '../components/Analytics/SentimentChart';
import RatingDistribution from '../components/Analytics/RatingDistribution';
import { 
  MessageSquare, 
  Star, 
  Clock, 
  TrendingUp,
  Loader2 
} from 'lucide-react';

interface AnalyticsData {
  totalReviews: number;
  averageRating: number;
  sentimentDistribution: Array<{ sentiment: string; _count: number }>;
  statusDistribution: Array<{ status: string; _count: number }>;
  recentReviews: any[];
}

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await reviewAPI.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRatingDistribution = () => {
    if (!analytics) return [];
    
    // Mock rating distribution - in real app, this would come from API
    const ratingCounts = analytics.recentReviews.reduce((acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return Object.entries(ratingCounts).map(([rating, count]) => ({
      rating: parseInt(rating),
      count: count as number,
    }));
  };

  const getResponseRate = () => {
    if (!analytics) return 0;
    
    const respondedCount = analytics.statusDistribution.find(
      s => s.status === 'RESPONDED'
    )?._count || 0;
    
    return analytics.totalReviews > 0 
      ? ((respondedCount / analytics.totalReviews) * 100).toFixed(1)
      : '0.0';
  };

  const getPendingCount = () => {
    if (!analytics) return 0;
    
    return analytics.statusDistribution.find(
      s => s.status === 'PENDING'
    )?._count || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load analytics data.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Review insights and performance metrics</p>
        </div>
        
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Reviews"
          value={analytics.totalReviews}
          icon={<MessageSquare className="h-6 w-6 text-blue-600" />}
          change={{
            value: 12,
            type: 'increase',
            period: 'vs last month',
          }}
        />
        
        <MetricCard
          title="Average Rating"
          value={analytics.averageRating.toFixed(1)}
          icon={<Star className="h-6 w-6 text-yellow-600" />}
          change={{
            value: 5,
            type: 'increase',
            period: 'vs last month',
          }}
        />
        
        <MetricCard
          title="Response Rate"
          value={`${getResponseRate()}%`}
          icon={<TrendingUp className="h-6 w-6 text-green-600" />}
          change={{
            value: 8,
            type: 'increase',
            period: 'vs last month',
          }}
        />
        
        <MetricCard
          title="Pending Reviews"
          value={getPendingCount()}
          icon={<Clock className="h-6 w-6 text-orange-600" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <SentimentChart data={analytics.sentimentDistribution} />
        <RatingDistribution data={getRatingDistribution()} />
      </div>

      {/* Recent Reviews */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Reviews</h3>
        
        <div className="space-y-4">
          {analytics.recentReviews.slice(0, 5).map((review) => (
            <div key={review.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="flex items-center">
                  {Array.from({ length: review.rating }, (_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                  {Array.from({ length: 5 - review.rating }, (_, i) => (
                    <Star key={i + review.rating} className="h-4 w-4 text-gray-300" />
                  ))}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {review.authorName}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  {review.restaurant?.name}
                </p>
                {review.text && (
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {review.text}
                  </p>
                )}
              </div>
              
              <div className="flex-shrink-0 text-right">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  review.sentiment === 'POSITIVE' 
                    ? 'bg-green-100 text-green-800'
                    : review.sentiment === 'NEGATIVE'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {review.sentiment}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;