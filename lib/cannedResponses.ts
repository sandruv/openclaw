// Types for canned responses
export interface CannedResponse {
  id: string;
  tags: string[];
  title: string;
  response: string;
  variables?: string[];
}

// Collection of canned responses
export const cannedResponses: CannedResponse[] = [
  {
    id: 'new-user-welcome',
    tags: ['new user'],
    title: 'New User Welcome',
    response: `<p>Hi $AREA,</p>
<p><br></p>
<p>Welcome to $SITE. Please see your login credentials below you can add to any email app (as a Microsoft 365 Work account) or use one of the links at the bottom.</p>`,
    variables: ['AREA', 'SITE']
  },
  {
    id: 'new-user-credentials',
    tags: ['new user', 'new credentials'],
    title: 'New User Credentials',
    response: `<p>Hi,</p>
<p>&nbsp;</p>
<p>Welcome to Team <strong>$CLIENT_NAME</strong>. Please see your login credentials below you can add to any email app (as a Microsoft 365 Work account) or use one of the links at the bottom.</p>
<p>&nbsp;</p>
<p><strong>Username:</strong> $USERNAME</p>
<p><strong>Password:</strong> $PASSWORD</p>
<p>&nbsp;</p>
<p>You will also need to setup the Microsoft Authenticator app for easiest and most secure way to access your account. Please refer to the video tutorial link below on how to finish the setup.</p>
<p><br></p>
<p>Please let us know if assistance is needed setting up. Thank you and have a great day.</p>
<p>&nbsp;</p>
<p>YanceyWorks Support Team help@yanceyworks.com | 9168901010 text/call</p>
<p>&nbsp;</p>
<p>Outlook on Web</p>
<p>https://u247.us/owa</p>
<p>&nbsp;</p>
<p>Outlook App</p>
<p>https://u247.us/outlook</p>
<p>&nbsp;</p>
<p>Microsoft Authenticator App</p>
<p>https://u247.us/ma</p>
<p>&nbsp;</p>
<p>MFA SETUP VIDEO</p>
<p>https://u247.us/mfasetup</p>`,
    variables: ['CLIENT_NAME', 'USERNAME', 'PASSWORD']
  },
  {
    id: 'issue-resolved',
    tags: ['issue resolved'],
    title: 'Issue Resolution',
    response: `<p>Hi $NAME,</p>
<p>&nbsp;</p>
<p>The issue has been resolved. We will continue to monitor to ensure everything remains stable.</p>
<p>&nbsp;</p>
<p>Please let us know if you need any further assistance.</p>
<p>&nbsp;</p>
<p>Best regards,</p>
<p>YanceyWorks Support Team</p>`,
    variables: ['NAME']
  },
  {
    id: 'new-workstation',
    tags: ['new workstation'],
    title: 'New Workstation Setup',
    response: `<p>A new workstation has been installed for &nbsp;<strong>$USERNAME.</strong>&nbsp; The following items were completed as a part of this service:&nbsp;</p>
<p><br><br class="ProseMirror-trailingBreak"></p>
<p>- Installed Windows with the latest security patches&nbsp;</p>
<p>- Added the workstation to the network&nbsp;</p>
<p>- Configured the user profile&nbsp;</p>
<p>- Added the agent for remote monitoring&nbsp;</p>
<p>- Installed all required 3rd party products</p>
<p>- Installed and configured MS Office</p>
<p>- Configured OneDrive&nbsp;</p>
<p>- Created and configured user email</p>
<p>- Installed AV solution</p>
<p>- Installed printers</p>
<p><br><br class="ProseMirror-trailingBreak"></p>
<p>After thorough testing, the workstation is certified for use.</p>`,
    variables: ['USERNAME']
  }
];

// Helper function to get a canned response by ID
export const getCannedResponseById = (id: string): CannedResponse | undefined => {
  return cannedResponses.find(response => response.id === id);
};

// Helper function to get canned responses by tag
export const getCannedResponsesByTag = (tag: string): CannedResponse[] => {
  return cannedResponses.filter(response => response.tags.includes(tag));
};

// Helper function to fill variables in a response
export const fillResponseVariables = (response: CannedResponse, variables: Record<string, string>): string => {
  let filledResponse = response.response;
  Object.entries(variables).forEach(([key, value]) => {
    filledResponse = filledResponse.replace(new RegExp(`\\$${key}`, 'g'), value);
  });
  return filledResponse;
};