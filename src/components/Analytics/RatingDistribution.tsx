import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Star } from 'lucide-react';

interface RatingDistributionProps {
  data: Array<{ rating: number; count: number }>;
}

const RatingDistribution: React.FC<RatingDistributionProps> = ({ data }) => {
  const chartData = Array.from({ length: 5 }, (_, i) => {
    const rating = 5 - i;
    const item = data.find(d => d.rating === rating);
    return {
      rating: `${rating} Star${rating !== 1 ? 's' : ''}`,
      count: item?.count || 0,
      fill: rating >= 4 ? '#10B981' : rating >= 3 ? '#F59E0B' : '#EF4444',
    };
  });

  const total = chartData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Rating Distribution</h3>
      
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="rating" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value} reviews`, 'Count']} />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        {chartData.map((item, index) => {
          const rating = 5 - index;
          const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0.0';
          
          return (
            <div key={rating} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {Array.from({ length: rating }, (_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                  {Array.from({ length: 5 - rating }, (_, i) => (
                    <Star key={i + rating} className="h-4 w-4 text-gray-300" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">{rating}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: item.fill,
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {percentage}%
                </span>
                <span className="text-sm text-gray-500 w-8 text-right">
                  {item.count}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RatingDistribution;