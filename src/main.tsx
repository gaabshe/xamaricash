import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { Toaster } from 'react-hot-toast';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster 
      position="top-right" 
      toastOptions={{
        style: {
          background: 'rgba(30, 41, 59, 0.85)',
          color: '#fff',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      }}
    />
  </React.StrictMode>,
)
