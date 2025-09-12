import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
  <GoogleOAuthProvider clientId="658227709017-en6mklv41l6jungrhmtkqlaa0n3trj8k.apps.googleusercontent.com">
    <BrowserRouter>
    <App />
    </BrowserRouter>
  </GoogleOAuthProvider>
  </React.StrictMode>
);