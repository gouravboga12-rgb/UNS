import React from 'react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col h-full shadow-sm">
      <div className="shimmer aspect-square w-full" />
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Category */}
          <div className="shimmer h-3 w-1/4 rounded" />
          {/* Title */}
          <div className="shimmer h-4 w-3/4 rounded" />
          {/* Rating */}
          <div className="shimmer h-3 w-1/3 rounded" />
          {/* Description */}
          <div className="shimmer h-3 w-full rounded" />
          <div className="shimmer h-3 w-5/6 rounded" />
        </div>
        <div className="space-y-3">
          {/* Price */}
          <div className="shimmer h-5 w-1/3 rounded" />
          {/* Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <div className="shimmer h-8 rounded-lg" />
            <div className="shimmer h-8 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const CategorySkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm p-4 flex items-center space-x-4">
      <div className="shimmer w-16 h-16 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="shimmer h-4 w-1/2 rounded" />
        <div className="shimmer h-3 w-3/4 rounded" />
      </div>
    </div>
  );
};
export default SkeletonLoader;
