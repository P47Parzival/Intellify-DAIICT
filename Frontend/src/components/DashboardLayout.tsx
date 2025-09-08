import React from 'react';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {children}
    </div>
  );
};

export default DashboardLayout;
