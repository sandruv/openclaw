"use client";

import React, { useState } from 'react';

interface TabSectionProps {
  children: React.ReactNode[];
  tabNames: string[];
}

export const TabSection: React.FC<TabSectionProps> = ({ children, tabNames }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="w-full">
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabNames.map((tabName, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-2 font-medium text-sm flex-1 transition-colors ${
              activeTab === index
                ? 'border-b-2 border-lime-500 dark:border-lime-400 text-lime-600 dark:text-lime-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-lime-500 dark:hover:text-lime-400'
            }`}
          >
            {tabName}
          </button>
        ))}
      </div>
      <div className="py-4">
        {children[activeTab]}
      </div>
    </div>
  );
};
