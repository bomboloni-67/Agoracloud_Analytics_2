import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Amplify } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';
import { Authenticator } from '@aws-amplify/ui-react';

// Enhanced check for local development
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const redirectUrl = isLocal 
  ? 'http://localhost:5173/Agoracloud_Analytics_2/' 
  : 'https://bomboloni-67.github.io/Agoracloud_Analytics_2/';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_CLIENT_ID,
      loginWith: {
        email: true,
        oauth: {
          domain: 'ap-southeast-1sv8ye23jx.auth.ap-southeast-1.amazoncognito.com',
          // UPDATED: Must match your AWS Console exactly
          scopes: [
            'email', 
            'openid', 
            'phone', // Added because it's in your console
            'aws.cognito.signin.user.admin'
          ],
          redirectSignIn: [redirectUrl], 
          redirectSignOut: [redirectUrl],
          responseType: 'code'
        }
      }
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Authenticator.Provider>
      <App />
    </Authenticator.Provider>
  </React.StrictMode>,
)