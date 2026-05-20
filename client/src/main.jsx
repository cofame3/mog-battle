import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || "Aa_y4jDu0lzpRULDtwktPcLMQPihEUPV2t0UxLg6RaaqE-29V8h9Qg7i-3QHdw7gVYtHfn0uGcQELalp";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "722291909748-itpqsmgjni0gvma752ne8rrilh6aoghg.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID, currency: "USD" }}>
          <App />
        </PayPalScriptProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
