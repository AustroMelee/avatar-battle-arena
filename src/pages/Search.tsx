import React from 'react';

const Search: React.FC = () => (
  <main className="container mx-auto p-8">
    <h1 className="text-2xl font-bold mb-4">Search Encyclopedia</h1>
    <input
      type="text"
      className="input input-bordered w-full mb-4"
      placeholder="Search for characters, bending, locations, etc..."
      aria-label="Search encyclopedia"
    />
    {/* TODO: Connect to FlexSearch index and display results */}
    <div className="mt-8 text-gray-500">Search results will appear here.</div>
  </main>
);

export default Search;
