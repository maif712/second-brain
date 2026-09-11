// src/main.tsx  (updated)
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { KnowledgeProvider } from '@/features/knowledge/context/KnowledgeContext';
import { ToastProvider } from '@/components/ui/toast/ToastContext';
import App from './app/App';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <KnowledgeProvider>
      <ToastProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ToastProvider>
    </KnowledgeProvider>
  </StrictMode>,
);