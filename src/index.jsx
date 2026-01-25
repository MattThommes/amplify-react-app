import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.scss';
import App from './App.jsx';
import { BrowserRouter as Router } from "react-router-dom";
import reportWebVitals from './reportWebVitals';

import { Amplify } from "aws-amplify";
import awsExports from './aws-exports';

// Check for development environment (supports both Vite and standard Node envs)
const isDev = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) || process.env.NODE_ENV === 'development';

if (isDev) {
    console.log("Environment: development");
    console.log("Configuring local API at http://localhost:3001");
    const API_NAME = 'apirest1';
    if (awsExports.aws_cloud_logic_custom) {
        awsExports.aws_cloud_logic_custom = awsExports.aws_cloud_logic_custom.map(api => {
            if (api.name === API_NAME) {
                return { ...api, endpoint: 'http://localhost:3001' };
            }
            return api;
        });
    }
}

Amplify.configure(awsExports);

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
