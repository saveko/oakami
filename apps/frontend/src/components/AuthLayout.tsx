'use client';

import React from 'react';

interface AuthLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  bottomLink?: React.ReactNode;
}

export default function AuthLayout({
  title,
  description,
  children,
  bottomLink,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600 mb-8">{description}</p>

        {children}

        {bottomLink && (
          <div className="mt-6 text-center text-gray-600">
            {bottomLink}
          </div>
        )}
      </div>
    </div>
  );
}
