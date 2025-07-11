import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => (
  <nav className="bg-gray-900 text-white px-4 py-2 flex gap-4 items-center">
    <Link to="/" className="font-bold text-lg">Austros ATLA World Encyclopedia</Link>
    <Link to="/search">Search</Link>
    <Link to="/characters">Characters</Link>
    <Link to="/bending">Bending</Link>
    <Link to="/locations">Locations</Link>
    <Link to="/fauna">Fauna</Link>
    <Link to="/food">Food</Link>
    <Link to="/spirit-world">Spirit World</Link>
  </nav>
);

export default Navbar;
