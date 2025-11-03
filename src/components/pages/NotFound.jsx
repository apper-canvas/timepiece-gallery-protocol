import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
        <p className="text-secondary mb-6">Page not found</p>
        <Link to="/" className="inline-block px-6 py-3 bg-accent text-white rounded-md hover:bg-secondary transition-colors">
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;