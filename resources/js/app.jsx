import React from 'react';
import ReactDOM from 'react-dom/client';
import Home from './pages/Home';

const rootElement = document.getElementById('app');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Home/>
    </React.StrictMode>
  );
}