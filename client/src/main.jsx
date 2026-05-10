import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'
import './index.css'
import App from './App.jsx'

const PAYPAL_CLIENT_ID = "ASLvrx5hslmnAbx8Wo0ZCAM8W3l0jpmoYF8E-zYD-7Q-PbTPE6gQ6UjqtwT4Wyzxc84jzzb6LB0MqsbR";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="722291909748-itpqsmgjni0gvma752ne8rrilh6aoghg.apps.googleusercontent.com">
      <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID, currency: "USD" }}>
        <App />
      </PayPalScriptProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
