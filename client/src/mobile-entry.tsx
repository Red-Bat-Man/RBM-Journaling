import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/hooks/use-auth';
import { FontSettingsProvider } from '@/hooks/use-font-settings';
import App from './App';
import './index.css';

// For the mobile app, we automatically get the API URL from Capacitor config
import { Capacitor } from '@capacitor/core';

// Function to get the base URL from Capacitor config or environment variables
function getApiBaseUrl() {
  if (Capacitor.isNativePlatform()) {
    // When running as a native app, use the server URL from capacitor config
    return Capacitor.getPluginImplementation<any>('WebView')?.getServerUrl() || '';
  }
  
  // Fallback for development
  return 'https://your-journal-backend-api.replit.app';
}

const API_BASE_URL = getApiBaseUrl();
console.log('Using API base URL:', API_BASE_URL);

// Override the default fetch behavior for react-query
const originalFetch = window.fetch;
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  let url = input.toString();
  
  // Only modify API URLs
  if (url.startsWith('/api/')) {
    url = `${API_BASE_URL}${url}`;
    console.log('Fetching from:', url);
    return originalFetch(url, {
      ...init,
      credentials: 'include', // Send cookies for authentication
    });
  }
  
  return originalFetch(input, init);
};

// Render the app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FontSettingsProvider>
          <App />
          <Toaster />
        </FontSettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);