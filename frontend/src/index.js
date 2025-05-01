import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import { Security } from "@okta/okta-react";
import { oktaAuth } from "./oktaConfig";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Security
      oktaAuth={oktaAuth}
      restoreOriginalUri={async (_auth, originalUri) => {
        window.location.replace(originalUri || "/");
      }}
    >
      <App />
    </Security>
  </BrowserRouter>
);
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
