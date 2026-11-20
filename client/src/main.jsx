import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/react'
import AuthProvider from './context/AuthContext.jsx'
import ToastProvider from './context/ToastContext.jsx'
import NotificationsProvider from './context/NotificationsContext.jsx'
import ApiWatcher from './components/ApiWatcher.jsx'

import './index.css'
import App from './App.jsx'

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!clerkPublishableKey) {
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY must be configured in client/.env')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <NotificationsProvider>
              <ApiWatcher />
              <App />
            </NotificationsProvider>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>,
)
