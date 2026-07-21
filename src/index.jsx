import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.scss';
import App from './App.jsx';
import { BrowserRouter as Router } from "react-router-dom";
import reportWebVitals from './reportWebVitals';

import { Amplify } from "aws-amplify";
import { parseAmplifyConfig } from "aws-amplify/utils";
import outputs from '../amplify_outputs.json';

// Check for development environment (supports both Vite and standard Node envs)
const isDev = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) || process.env.NODE_ENV === 'development';

// 1. Parse Gen 2 outputs into the standard runtime format
const amplifyConfig = parseAmplifyConfig(outputs);

// 2. Configure API / REST custom settings
let config = {
  ...amplifyConfig,
  API: {
    ...amplifyConfig.API,
    REST: outputs.custom?.API?.REST || {},
  },
};

if (isDev) {
    console.log("Environment: development");
    console.log("Configuring local API at http://localhost:3001");
    
    const API_NAME = 'apirest1';

    config = {
      ...config,
      API: {
        ...config.API,
        REST: {
          ...config.API?.REST,
          [API_NAME]: {
            endpoint: "http://localhost:3001",
            region: "us-east-1"
          }
        }
      }
    };
}

Amplify.configure(config);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
