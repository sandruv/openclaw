import { ConfidentialClientApplication, Configuration, AuthorizationUrlRequest } from "@azure/msal-node";

const msalConfig: Configuration = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID || 'placeholder',
    authority: `https://login.microsoftonline.com/common`,
    clientSecret: process.env.AZURE_CLIENT_SECRET || 'placeholder'
  }
};

// Only initialize if credentials are actually available (not during build)
const hasCredentials = process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET;
export const msalClient = hasCredentials 
  ? new ConfidentialClientApplication(msalConfig)
  : null as any as ConfidentialClientApplication;

export const tokenRequest = {
  scopes: ["https://graph.microsoft.com/.default"]
};

export const authUrlRequest: AuthorizationUrlRequest = {
  scopes: ["User.Read", "Mail.Read", "Mail.Send"],
  redirectUri: process.env.REDIRECT_URI || ""
};


