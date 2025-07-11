import React from 'react';
import AppRouter from './router';
import { lightThemeClass } from './styles/themes/lightTheme.css';

const App: React.FC = () => (
  <div className={lightThemeClass}>
    <AppRouter />
  </div>
);

export default App;
