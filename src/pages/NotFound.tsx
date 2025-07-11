import React from 'react';

const NotFound: React.FC = () => (
  <main className="container mx-auto p-8 text-center">
    <h1 className="text-3xl font-bold mb-4">404 - Not Found</h1>
    <p className="mb-6">Sorry, the page you are looking for does not exist.</p>
    <a href="/" className="inline-block px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">Go Home</a>
  </main>
);

export default NotFound;
