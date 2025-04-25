
import React from 'react';
import { Brain } from 'lucide-react';

const Header = () => {
  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain size={28} className="text-ml-primary" />
          <h1 className="font-bold text-2xl text-ml-primary">InsightML Studio</h1>
        </div>
        <div className="text-sm text-gray-600">
          Build, train, and understand machine learning models
        </div>
      </div>
    </header>
  );
};

export default Header;
