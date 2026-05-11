import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'
import './index.css'
import App from './App.jsx'

const PAYPAL_CLIENT_ID = "ASpQz7ruPUDFRYW1Ej8OOzo6BUZ5YvnRDA0JemrXE5wgRGR_HEvRsgOHSIQE5sqN-deB9dLdehAlSVum";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="722291909748-itpqsmgjni0gvma752ne8rrilh6aoghg.apps.googleusercontent.com">
      <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID, currency: "USD" }}>
        <App />
      </PayPalScriptProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
