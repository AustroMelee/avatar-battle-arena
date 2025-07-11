import React from 'react';

const Home: React.FC = () => (
  <main className="container mx-auto p-8">
    <h1 className="text-3xl font-bold mb-4">Austros ATLA World Encyclopedia</h1>
    <p className="mb-6">Welcome! Explore the world of Avatar through characters, bending arts, locations, fauna, and more.</p>
    <nav className="flex flex-wrap gap-4">
      <a href="/search" className="btn">Search</a>
      <a href="/characters" className="btn">Characters</a>
      <a href="/bending" className="btn">Bending Arts</a>
      <a href="/locations" className="btn">Locations</a>
      <a href="/fauna" className="btn">Fauna</a>
      <a href="/food" className="btn">Food</a>
      <a href="/spirit-world" className="btn">Spirit World</a>
    </nav>
  </main>
);

export default Home;
