import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
    </div>
  );
}