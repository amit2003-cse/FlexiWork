import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-white/5 border border-white/10 rounded-3xl p-8 animate-pulse">
    <div className="w-14 h-14 bg-white/10 rounded-2xl mb-6"></div>
    <div className="h-6 bg-white/10 rounded-full w-2/3 mb-4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-white/10 rounded-full w-full"></div>
      <div className="h-4 bg-white/10 rounded-full w-5/6"></div>
      <div className="h-4 bg-white/10 rounded-full w-4/5"></div>
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-12 animate-pulse">
    <div className="flex justify-between items-end border-b border-white/10 pb-8">
      <div className="space-y-4">
        <div className="h-10 bg-white/10 rounded-xl w-48"></div>
        <div className="h-4 bg-white/10 rounded-full w-64"></div>
      </div>
      <div className="h-10 bg-white/10 rounded-xl w-32"></div>
    </div>
    
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 bg-white/5 border border-white/10 rounded-2xl"></div>
      ))}
    </div>
  </div>
);

export const JobFeedSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="h-64 bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="h-6 bg-white/10 rounded-full w-3/4 mb-4"></div>
        <div className="h-4 bg-white/10 rounded-full w-1/4 mb-6"></div>
        <div className="space-y-3 mb-8">
          <div className="h-4 bg-white/10 rounded-full w-full"></div>
          <div className="h-4 bg-white/10 rounded-full w-full"></div>
        </div>
        <div className="h-10 bg-white/10 rounded-xl w-full"></div>
      </div>
    ))}
  </div>
);
