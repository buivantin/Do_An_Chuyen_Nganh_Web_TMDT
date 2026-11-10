import React from 'react';
import ReactDOM from 'react-dom/client';
import HomeSample from './pages/HomeSample';

const rootElement = document.getElementById('app');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <HomeSample />
    </React.StrictMode>
  );
}