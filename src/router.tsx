import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Search from './pages/Search';
import Characters from './pages/Characters';
import Bending from './pages/Bending';
import Locations from './pages/Locations';
import Fauna from './pages/Fauna';
import Food from './pages/Food';
import SpiritWorld from './pages/SpiritWorld';
import NotFound from './pages/NotFound';

const AppRouter: React.FC = () => (
  <Router>
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/characters" element={<Characters />} />
        <Route path="/bending" element={<Bending />} />
        <Route path="/locations" element={<Locations />} />
        <Route path="/fauna" element={<Fauna />} />
        <Route path="/food" element={<Food />} />
        <Route path="/spirit-world" element={<SpiritWorld />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  </Router>
);

export default AppRouter;
