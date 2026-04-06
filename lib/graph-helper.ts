import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import { ClientSecretCredential } from "@azure/identity";
import { msalClient, authUrlRequest } from "./msal-config";
import { ConfidentialClientApplication } from "@azure/msal-node";

// Only initialize if credentials are actually available (not during build)
const hasAzureCredentials = process.env.AZURE_TENANT_ID && 
                            process.env.AZURE_CLIENT_ID && 
                            process.env.AZURE_CLIENT_SECRET;

let graphClient: Client;

if (hasAzureCredentials) {
  const credential = new ClientSecretCredential(
    process.env.AZURE_TENANT_ID!,
    process.env.AZURE_CLIENT_ID!,
    process.env.AZURE_CLIENT_SECRET!
  );

  const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes: ['https://graph.microsoft.com/.default']
  });

  graphClient = Client.initWithMiddleware({ authProvider });
} else {
  // Placeholder during build - will never be called at runtime
  graphClient = null as any as Client;
}

export { graphClient };

export async function getAuthUrl() {
  return await msalClient.getAuthCodeUrl(authUrlRequest);
}

export async function getAccessToken(authCode: string) {
  const tokenRequest = {
    code: authCode,
    scopes: authUrlRequest.scopes,
    redirectUri: authUrlRequest.redirectUri,
  };

  const response = await msalClient.acquireTokenByCode(tokenRequest);

  return response;
}

export function getGraphClient(accessToken: string) {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    }
  });
}

export async function getUserInfo(accessToken: string) {
  const graphClient = getGraphClient(accessToken);
  return graphClient.api('/me').get();
}

export interface Attachment {
  name: string;
  contentType: string;
  content: string;
}

export async function sendEmail(originalMessageId: string, subject: string, body: string, toRecipients: string[], ccRecipients: string[], attachments: Attachment[]) {
  const sendMail: any = {
    message: {
      subject: subject,
      body: {
        contentType: "HTML",
        content: body
      },
      toRecipients: toRecipients.map((email) => ({
        emailAddress: {
          address: email
        }
      })),
      ccRecipients: ccRecipients && ccRecipients.length > 0 ? ccRecipients.map((email) => ({ 
        emailAddress: { 
          address: email 
        } 
      })) : undefined,
      attachments: attachments.map((attachment) => ({
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: attachment.name,
        contentType: attachment.contentType,
        contentBytes: attachment.content
      }))
    },
    saveToSentItems: true
  }; 

  const baseEmail = process.env.BASE_EMAIL;

  const userResponse = await graphClient.api('/users').filter(`mail eq '${baseEmail}'`).get();
  const user = userResponse.value[0];

  if(originalMessageId != ""){
    await graphClient.api(`/users/${user.id}/messages/${originalMessageId}/reply`).post(sendMail);
  }else {
    await graphClient.api(`/users/${user.id}/sendMail`).post(sendMail);
  }
}

export async function getAllEmails(email: string = process.env.BASE_EMAIL ? process.env.BASE_EMAIL.toString() : 'marioc@yanceyworks.com') {

  // Get current date/time
  const now = new Date();

  // Calculate date/time from 5 mins ago
  const fiveMinsAgo = new Date(now);
  fiveMinsAgo.setMinutes(now.getMinutes() - 5);

  // Format as ISO string for the filter
  const formattedTime = fiveMinsAgo.toISOString();

  //isRead eq false or 
  const response = await graphClient.api(`/users/${email}/mailFolders/inbox/messages`)
    .filter(`receivedDateTime ge ${formattedTime}`)
    .select('subject,body,receivedDateTime,sentDateTime,from,toRecipients,ccRecipients,hasAttachments,id,conversationId')
    .orderby("receivedDateTime desc")
    .get();

  const messagesWithAttachments = await Promise.all(
    response.value.map(async (message: { id: string }) => {
      await graphClient.api(`/users/${email}/messages/${message.id}`).update({ isRead: true });
      
      const attachmentsResponse = await graphClient.api(`/users/${email}/messages/${message.id}/attachments`)
        .select('id,name,contentType,size')
        .get();
      
      const fullAttachments = await Promise.all(
        attachmentsResponse.value.map(async (attachment: { id: string }) => {
          const fullAttachment = await graphClient.api(`/users/${email}/messages/${message.id}/attachments/${attachment.id}`)
            .get();
          return fullAttachment;
        })
      );
      
      return {
        ...message,
        attachments: fullAttachments
      };
    })
  );
  response.value = messagesWithAttachments;

  return response;
}

export async function getEmail(email: string = process.env.BASE_EMAIL ? process.env.BASE_EMAIL.toString() : 'marioc@yanceyworks.com', messageId: string) {
  const response = await graphClient.api(`/users/${email}/messages/${messageId}`)
    .select('subject,body,receivedDateTime,sentDateTime,from,toRecipients,ccRecipients,hasAttachments,id,conversationId')
    .get();

  const attachmentsResponse = await graphClient
    .api(`/users/${email}/messages/${messageId}/attachments`)
    .select("id,name,contentType,size")
    .get()

  const fullAttachments = await Promise.all(
    attachmentsResponse.value.map(async (attachment: { id: string }) => {
      const fullAttachment = await graphClient
        .api(`/users/${email}/messages/${messageId}/attachments/${attachment.id}`)
        .get()
      return fullAttachment
    }),
  )

  response.attachments = fullAttachments

  return response;
}

export async function getOrganizationUsers(top: number = 999) {
  try {
    const response = await graphClient.api('/users')
      .top(top)
      .select("id,givenName,surname,mobilePhone,displayName,mail,jobTitle,department,accountEnabled,assignedLicenses,signInActivity")
      .get();

    return response;
  } catch (error: any) {
    console.error('Error fetching organization users:', error.message);
    throw error;
  }
}

export async function getOrganizationUser(userId: string) {
  try {
    const response = await graphClient.api(`/users/${userId}`)
      .select('id,displayName,mail,jobTitle,department,accountEnabled,mail,assignedLicenses,signInActivity')
      .get();

    return response;
  } catch (error: any) {
    console.error('Error fetching organization users:', error.message);
    throw error;
  }
}

export async function getConnectedTenants() {
  try {
    const response = await graphClient.api("/contracts").get();

    return response;
  } catch (error) {
    console.error("Error fetching connected tenants:", error);
    throw error;
  }
}

export async function microsoftClientUsers(targetTenantId: string) {
  const msalClient = new ConfidentialClientApplication({
    auth: {
      clientId: process.env.AZURE_CLIENT_ID!, 
      clientSecret: process.env.AZURE_CLIENT_SECRET!, 
      authority: `https://login.microsoftonline.com/${targetTenantId}` 
    }
  });
  
  try {
    // 2. Acquire token for the target tenant
    const tokenResponse = await msalClient.acquireTokenByClientCredential({
      scopes: ["https://graph.microsoft.com/.default"]
    });
    
    // 3. Call Microsoft Graph with the token
     const graphUrl =
      "https://graph.microsoft.com/v1.0/users" +
      "?$select=id,givenName,surname,mobilePhone,displayName,mail,jobTitle,department,accountEnabled,assignedLicenses,signInActivity";

    const response = await fetch(graphUrl, {
      headers: {
        Authorization: `Bearer ${tokenResponse!.accessToken}`,
        "Content-Type": "application/json"
      }
    });
    
    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function microsoftClientOrg(targetTenantId: string) {
  const msalClient = new ConfidentialClientApplication({
    auth: {
      clientId: process.env.AZURE_CLIENT_ID!, 
      clientSecret: process.env.AZURE_CLIENT_SECRET!, 
      authority: `https://login.microsoftonline.com/${targetTenantId}` 
    }
  });
  
  try {
    // 2. Acquire token for the target tenant
    const tokenResponse = await msalClient.acquireTokenByClientCredential({
      scopes: ["https://graph.microsoft.com/.default"]
    });
    
    // 3. Call Microsoft Graph with the token
    const response = await fetch(
      "https://graph.microsoft.com/v1.0/organization",
      {
        headers: {
          Authorization: `Bearer ${tokenResponse?.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return await response.json();
  } catch (error) {
    throw error;
  }
}