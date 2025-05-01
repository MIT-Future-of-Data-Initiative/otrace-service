import { OktaAuth } from "@okta/okta-auth-js";

export const oktaAuth = new OktaAuth({
  issuer: process.env.REACT_APP_OKTA_ISSUER,
  clientId: process.env.REACT_APP_OKTA_CLIENT_ID,
  redirectUri: window.location.origin + "/login/callback",
  scopes: ["email", "openid", "groups", "firstName"],
  pkce: true,
});
