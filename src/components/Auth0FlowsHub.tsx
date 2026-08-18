import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Key, 
  Lock, 
  Smartphone, 
  Terminal, 
  RefreshCw, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  FileText,
  Cpu,
  Layers,
  Zap,
  Tv,
  Radio,
  ArrowRight,
  HelpCircle,
  Code2,
  Binary,
  Share2,
  Eye,
  Flame,
  Check,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from './Toast.tsx';

interface Auth0Flow {
  id: string;
  name: string;
  badge: string;
  category: 'Standard Web & Mobile' | 'Privacy & Enterprise' | 'Machine & IoT' | 'Advanced & Legacy';
  rfcOrStandard: string;
  description: string;
  bestFor: string;
  securityRating: 'Recommended' | 'High Security' | 'Specialized' | 'Legacy / Caution';
  endpoints: Record<string, string>;
  grantTypeOrResponseType: string;
  samplePayload: Record<string, any>;
  steps: { step: number; title: string; from: string; to: string; detail: string }[];
  documentationUrls: { title: string; url: string }[];
}

const auth0FlowsData: Auth0Flow[] = [
  {
    id: 'auth_code',
    name: 'Authorization Code Flow',
    badge: 'Server-Side Apps',
    category: 'Standard Web & Mobile',
    rfcOrStandard: 'OAuth 2.0 RFC 6749 §4.1',
    description: 'Because regular web apps are server-side apps where the source code and client secret are protected, they exchange an Authorization Code for tokens directly on the backend.',
    bestFor: 'Traditional web applications with a secure backend (Node.js/Express, Next.js API, Django, Ruby on Rails, ASP.NET).',
    securityRating: 'Recommended',
    grantTypeOrResponseType: 'response_type=code / grant_type=authorization_code',
    endpoints: {
      authorize: 'https://{tenant}.us.auth0.com/authorize',
      token: 'https://{tenant}.us.auth0.com/oauth/token',
      userinfo: 'https://{tenant}.us.auth0.com/userinfo'
    },
    samplePayload: {
      client_id: 'dcp_web_app_client_id_01',
      response_type: 'code',
      redirect_uri: 'https://displaycellpros.com/api/auth/callback',
      scope: 'openid profile email offline_access',
      state: 'xyz_state_csrf_token_8842',
      audience: 'https://api.displaycellpros.com'
    },
    steps: [
      { step: 1, title: 'Redirect to Auth0', from: 'User Browser', to: 'Auth0 Authorization Server', detail: 'App redirects user to /authorize with client_id, scope, and state.' },
      { step: 2, title: 'User Authenticates', from: 'User', to: 'Auth0 Universal Login', detail: 'User enters credentials, social login, or Enterprise SSO.' },
      { step: 3, title: 'Return Authorization Code', from: 'Auth0', to: 'Backend Callback URL', detail: 'Auth0 redirects browser back to redirect_uri with temporary authorization code.' },
      { step: 4, title: 'Code for Token Exchange', from: 'Backend Server', to: 'Auth0 /oauth/token', detail: 'Server sends code + client_secret via secure backchannel to receive Access Token, ID Token & Refresh Token.' }
    ],
    documentationUrls: [
      { title: 'Authorization Code Flow', url: 'https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow' },
      { title: 'Add Login with Auth Code', url: 'https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow/add-login-auth-code-flow' },
      { title: 'Call API with Auth Code', url: 'https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow/call-your-api-using-the-authorization-code-flow' }
    ]
  },
  {
    id: 'pkce',
    name: 'Auth Code with PKCE',
    badge: 'SPAs & Mobile Apps',
    category: 'Standard Web & Mobile',
    rfcOrStandard: 'RFC 7636 (Proof Key for Code Exchange)',
    description: 'Cryptographically protects public clients (Single-Page Apps and Native Mobile apps) that cannot safely hold a Client Secret against authorization code interception attacks.',
    bestFor: 'React/Vue/Angular SPAs, iOS/Android Swift & Kotlin apps, React Native, and Flutter.',
    securityRating: 'Recommended',
    grantTypeOrResponseType: 'code_challenge_method=S256 / code_verifier exchange',
    endpoints: {
      authorize: 'https://{tenant}.us.auth0.com/authorize',
      token: 'https://{tenant}.us.auth0.com/oauth/token'
    },
    samplePayload: {
      client_id: 'dcp_spa_client_pkce_02',
      response_type: 'code',
      code_challenge: 'E9Melhoa2OwvFrGMTJguCH5rtx64FI41BH-88Qi3Waw',
      code_challenge_method: 'S256',
      redirect_uri: 'https://displaycellpros.com/callback',
      scope: 'openid profile email offline_access',
      audience: 'https://api.displaycellpros.com'
    },
    steps: [
      { step: 1, title: 'Generate PKCE Pair', from: 'Client SPA / Mobile', to: 'Local Memory', detail: 'Client generates high-entropy code_verifier and calculates SHA-256 code_challenge.' },
      { step: 2, title: 'Authorize with Challenge', from: 'Client App', to: 'Auth0 /authorize', detail: 'Sends code_challenge & code_challenge_method=S256 with standard OAuth parameters.' },
      { step: 3, title: 'Auth0 Issues Code', from: 'Auth0', to: 'Client Callback', detail: 'Auth0 stores code_challenge and returns temporary authorization code.' },
      { step: 4, title: 'Verify & Exchange', from: 'Client App', to: 'Auth0 /oauth/token', detail: 'Client sends code + plain code_verifier. Auth0 hashes verifier and confirms it matches original challenge before returning JWT tokens.' }
    ],
    documentationUrls: [
      { title: 'Authorization Code Flow with PKCE', url: 'https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-pkce' },
      { title: 'Add Login Using PKCE', url: 'https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-pkce/add-login-using-the-authorization-code-flow-with-pkce' }
    ]
  },
  {
    id: 'rar_par_jar',
    name: 'Enhanced Privacy (RAR / PAR / JAR)',
    badge: 'High Security & FAPI',
    category: 'Privacy & Enterprise',
    rfcOrStandard: 'RFC 9396 (RAR), RFC 9126 (PAR), RFC 9101 (JAR)',
    description: 'Advanced protocols for regulated sectors (FinTech, Open Banking, Healthcare, Highly-Regulated Identity). Pushes parameters securely (PAR), signs request objects (JAR), and details fine-grained transactional authorization (RAR).',
    bestFor: 'Banking APIs, Payment Initiation, Healthcare HIPAA scopes, and OpenID Financial-Grade API (FAPI) compliance.',
    securityRating: 'High Security',
    grantTypeOrResponseType: 'authorization_details / request_uri / signed JWT',
    endpoints: {
      par: 'https://{tenant}.us.auth0.com/oauth/par',
      authorize: 'https://{tenant}.us.auth0.com/authorize?client_id=...&request_uri=urn:ietf:params:oauth:request_uri:...',
      token: 'https://{tenant}.us.auth0.com/oauth/token'
    },
    samplePayload: {
      client_id: 'dcp_fapi_bank_client',
      authorization_details: [
        {
          type: 'repair_invoice_payment',
          repair_id: 'DCP-REP-2026-8842',
          actions: ['authorize_charge', 'release_hardware'],
          locations: ['https://api.displaycellpros.com/payments'],
          instructedAmount: { currency: 'USD', amount: '249.00' }
        }
      ],
      pushed_authorization_request: true,
      request_uri: 'urn:ietf:params:oauth:request_uri:9f8e7d6c5b4a3'
    },
    steps: [
      { step: 1, title: 'Push Parameters (PAR)', from: 'Client Backend', to: 'Auth0 /oauth/par', detail: 'Client POSTs fine-grained authorization_details (RAR) and sensitive data directly to PAR endpoint.' },
      { step: 2, title: 'Obtain request_uri', from: 'Auth0', to: 'Client Backend', detail: 'Auth0 securely stores parameters and returns an opaque, single-use request_uri with short TTL.' },
      { step: 3, title: 'Clean Browser Redirect', from: 'User Browser', to: 'Auth0 /authorize', detail: 'Redirects with only client_id and request_uri—no sensitive query parameters are exposed in URL history or access logs.' },
      { step: 4, title: 'Encrypted Token Issue (JWE)', from: 'Auth0', to: 'Client Backend', detail: 'Auth0 verifies signature and returns JSON Web Encrypted (JWE) tokens.' }
    ],
    documentationUrls: [
      { title: 'Rich Authorization Requests (RAR)', url: 'https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow/authorization-code-flow-with-rar' },
      { title: 'Pushed Authorization Requests (PAR)', url: 'https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow/authorization-code-flow-with-par' },
      { title: 'JWT-Secured Authorization Requests (JAR)', url: 'https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow/authorization-code-flow-with-jar' }
    ]
  },
  {
    id: 'client_credentials',
    name: 'Client Credentials Flow (M2M)',
    badge: 'Machine-to-Machine',
    category: 'Machine & IoT',
    rfcOrStandard: 'OAuth 2.0 RFC 6749 §4.4',
    description: 'Used for machine-to-machine (M2M) applications like daemons, scheduled cron jobs, background worker services, or backend APIs communicating with other APIs without user interaction.',
    bestFor: 'Backend services, microservices, cloud functions, CLI administrative tools, and automated testing suites.',
    securityRating: 'Recommended',
    grantTypeOrResponseType: 'grant_type=client_credentials',
    endpoints: {
      token: 'https://{tenant}.us.auth0.com/oauth/token'
    },
    samplePayload: {
      grant_type: 'client_credentials',
      client_id: 'm2m_dcp_inventory_sync_service',
      client_secret: 'sec_prod_994827163018274615293048',
      audience: 'https://api.displaycellpros.com'
    },
    steps: [
      { step: 1, title: 'M2M Token Request', from: 'Daemon / Microservice', to: 'Auth0 /oauth/token', detail: 'Service sends POST request with client_id, client_secret, and target API audience.' },
      { step: 2, title: 'Client Grant Validation', from: 'Auth0 Engine', to: 'Client Grant Policy', detail: 'Auth0 verifies client credentials and scopes permitted on the API client grant.' },
      { step: 3, title: 'Access Token Issued', from: 'Auth0', to: 'Microservice', detail: 'Auth0 returns a signed RS256 JWT Access Token valid for authorized backend API calls.' }
    ],
    documentationUrls: [
      { title: 'Client Credentials Flow', url: 'https://auth0.com/docs/get-started/authentication-and-authorization-flow/client-credentials-flow' },
      { title: 'Call API Using Client Credentials', url: 'https://auth0.com/docs/get-started/authentication-and-authorization-flow/client-credentials-flow/call-your-api-using-the-client-credentials-flow' }
    ]
  },
  {
    id: 'device_auth',
    name: 'Device Authorization Flow',
    badge: 'Smart TVs & IoT',
    category: 'Machine & IoT',
    rfcOrStandard: 'OAuth 2.0 RFC 8628',
    description: 'Enables internet-connected, input-constrained devices (smart TVs, gaming consoles, IoT devices, terminal CLI tools) to instruct the user to complete login on a second device like a smartphone.',
    bestFor: 'Apple TV, Android TV, Roku, Smart Appliances, Command-line CLIs with no local browser.',
    securityRating: 'Recommended',
    grantTypeOrResponseType: 'grant_type=urn:ietf:params:oauth:grant-type:device_code',
    endpoints: {
      deviceCode: 'https://{tenant}.us.auth0.com/oauth/device/code',
      token: 'https://{tenant}.us.auth0.com/oauth/token'
    },
    samplePayload: {
      client_id: 'dcp_smart_workbench_display',
      scope: 'openid profile read:repairs manage:stations',
      audience: 'https://api.displaycellpros.com'
    },
    steps: [
      { step: 1, title: 'Request Device Code', from: 'Smart TV / IoT Device', to: 'Auth0 /oauth/device/code', detail: 'Device requests a device_code, user_code, and verification_uri.' },
      { step: 2, title: 'Display QR & Code to User', from: 'Device Screen', to: 'End User', detail: 'Device displays: "Go to displaycellpros.com/activate and enter code: WDTC-KRLP" (or scans QR code).' },
      { step: 3, title: 'User Authorizes on Mobile', from: 'User Smartphone', to: 'Auth0 Universal Login', detail: 'User logs in on their phone and confirms access for the device.' },
      { step: 4, title: 'Device Polls Token', from: 'IoT Device', to: 'Auth0 /oauth/token', detail: 'Device repeatedly polls /oauth/token until user completes authorization, then receives Access & Refresh tokens.' }
    ],
    documentationUrls: [
      { title: 'Device Authorization Flow', url: 'https://auth0.com/docs/get-started/authentication-and-authorization-flow/device-authorization-flow' },
      { title: 'Call API with Device Flow', url: 'https://auth0.com/docs/get-started/authentication-and-authorization-flow/device-authorization-flow/call-your-api-using-the-device-authorization-flow' }
    ]
  },
  {
    id: 'ciba',
    name: 'Client-Initiated Backchannel (CIBA)',
    badge: 'Decoupled Authentication',
    category: 'Privacy & Enterprise',
    rfcOrStandard: 'OpenID Foundation CIBA Core 1.0',
    description: 'Decoupled authentication flow where the client app backend initiates authentication on behalf of a user who confirms the request on a separate consumption device (such as an authenticator push notification on their phone).',
    bestFor: 'Point of sale (POS) terminals, call center agents verifying phone callers, smart speakers, kiosk check-in stations.',
    securityRating: 'High Security',
    grantTypeOrResponseType: 'grant_type=urn:openid:params:grant-type:ciba',
    endpoints: {
      bcAuthorize: 'https://{tenant}.us.auth0.com/bc-authorize',
      token: 'https://{tenant}.us.auth0.com/oauth/token'
    },
    samplePayload: {
      client_id: 'dcp_pos_register_spokane',
      login_hint: 'user@displaycellpros.com',
      binding_message: 'Authorize repair bench payment #8842',
      scope: 'openid profile offline_access payments:charge'
    },
    steps: [
      { step: 1, title: 'Backend Initiates Challenge', from: 'POS Register / Agent Console', to: 'Auth0 /bc-authorize', detail: 'Sends user identifier (login_hint or user_id) and binding message to Auth0.' },
      { step: 2, title: 'Push Notification to User', from: 'Auth0 Guardian', to: 'User Smartphone App', detail: 'Auth0 sends push notification with binding message to user registered mobile device.' },
      { step: 3, title: 'Biometric Approval', from: 'User', to: 'Mobile Authenticator', detail: 'User approves login with FaceID/fingerprint on their personal smartphone.' },
      { step: 4, title: 'Backchannel Token Issue', from: 'Auth0', to: 'POS Backend', detail: 'Auth0 delivers tokens to the POS backend via Poll mode, Ping mode, or Push webhook.' }
    ],
    documentationUrls: [
      { title: 'CIBA Overview', url: 'https://auth0.com/docs/get-started/authentication-and-authorization-flow/client-initiated-backchannel-authentication-flow' },
      { title: 'User Authentication with CIBA', url: 'https://auth0.com/docs/get-started/authentication-and-authorization-flow/client-initiated-backchannel-authentication-flow/user-authentication-with-ciba' },
      { title: 'User Authorization with CIBA', url: 'https://auth0.com/docs/get-started/authentication-and-authorization-flow/client-initiated-backchannel-authentication-flow/user-authorization-with-ciba' }
    ]
  },
  {
    id: 'custom_token_exchange',
    name: 'Custom Token Exchange (CTE)',
    badge: 'Token Transformation',
    category: 'Advanced & Legacy',
    rfcOrStandard: 'OAuth 2.0 RFC 8693',
    description: 'Enables applications to exchange pre-existing identity tokens (from legacy IDPs, third-party clouds, or partner security tokens) for Auth0 tokens by invoking /oauth/token associated with Auth0 Actions.',
    bestFor: 'Cross-audience delegation, microservice impersonation, legacy identity migration, and multi-cloud security token bridging.',
    securityRating: 'Specialized',
    grantTypeOrResponseType: 'grant_type=urn:ietf:params:oauth:grant-type:token-exchange',
    endpoints: {
      token: 'https://{tenant}.us.auth0.com/oauth/token'
    },
    samplePayload: {
      grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
      client_id: 'dcp_cloud_bridge_client',
      subject_token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImxlZ2FjeS0...',
      subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
      requested_token_type: 'urn:ietf:params:oauth:token-type:access_token',
      audience: 'https://api.displaycellpros.com'
    },
    steps: [
      { step: 1, title: 'Submit External Token', from: 'Calling App', to: 'Auth0 /oauth/token', detail: 'Passes external subject_token with subject_token_type to Auth0 token exchange endpoint.' },
      { step: 2, title: 'Execute Custom Action', from: 'Auth0 Engine', to: 'Custom Token Exchange Profile', detail: 'Auth0 validates external signature and runs custom Action code to map claims and permissions.' },
      { step: 3, title: 'Issue Auth0 Token', from: 'Auth0', to: 'Client App', detail: 'Issues native Auth0 JWT token configured for target audience.' }
    ],
    documentationUrls: [
      { title: 'Custom Token Exchange Overview', url: 'https://auth0.com/docs/authenticate/custom-token-exchange' },
      { title: 'Configure Custom Token Exchange', url: 'https://auth0.com/docs/authenticate/custom-token-exchange/configure-custom-token-exchange' },
      { title: 'CTE Example Use Cases', url: 'https://auth0.com/docs/authenticate/custom-token-exchange/cte-example-use-cases' }
    ]
  },
  {
    id: 'hybrid_flow',
    name: 'Hybrid Flow',
    badge: 'Immediate ID Token',
    category: 'Advanced & Legacy',
    rfcOrStandard: 'OpenID Connect Core 1.0 §3.3',
    description: 'Combines features of Authorization Code Flow and Implicit Flow to allow the client application to receive an immediate ID token on redirect while securely retrieving access and refresh tokens on the backend.',
    bestFor: 'Server-side web apps that need user identity immediately in the browser before completing background processing.',
    securityRating: 'Specialized',
    grantTypeOrResponseType: 'response_type=code id_token / code token / code id_token token',
    endpoints: {
      authorize: 'https://{tenant}.us.auth0.com/authorize',
      token: 'https://{tenant}.us.auth0.com/oauth/token'
    },
    samplePayload: {
      client_id: 'dcp_hybrid_portal_client',
      response_type: 'code id_token',
      response_mode: 'form_post',
      redirect_uri: 'https://displaycellpros.com/portal/callback',
      scope: 'openid profile email offline_access',
      nonce: 'n-0S6_WzA2Mj',
      state: 'af0ifjsldkj'
    },
    steps: [
      { step: 1, title: 'Request Hybrid Response', from: 'Browser', to: 'Auth0 /authorize', detail: 'Passes response_type=code id_token and mandatory nonce parameter.' },
      { step: 2, title: 'Immediate ID Token + Code', from: 'Auth0', to: 'Browser via Form Post', detail: 'Returns ID token immediately for instant frontend rendering, along with authorization code.' },
      { step: 3, title: 'Server Token Exchange', from: 'Backend Server', to: 'Auth0 /oauth/token', detail: 'Backend server exchanges authorization code with client secret for API access and refresh tokens.' }
    ],
    documentationUrls: [
      { title: 'Hybrid Flow', url: 'https://auth0.com/docs/get-started/authentication-and-authorization-flow/hybrid-flow' },
      { title: 'Call API Using Hybrid Flow', url: 'https://auth0.com/docs/get-started/authentication-and-authorization-flow/hybrid-flow/call-api-hybrid-flow' }
    ]
  },
  {
    id: 'implicit_flow',
    name: 'Implicit Flow with Form Post',
    badge: 'Legacy / ID Token Only',
    category: 'Advanced & Legacy',
    rfcOrStandard: 'OpenID Connect Form Post Response Mode',
    description: 'Alternative for public clients unable to store secrets. While no longer recommended for access tokens, when used with form_post response mode it offers a streamlined workflow for pure user ID token authentication.',
    bestFor: 'Legacy SPA architectures requesting user authentication without calling downstream protected APIs.',
    securityRating: 'Legacy / Caution',
    grantTypeOrResponseType: 'response_type=id_token / response_mode=form_post',
    endpoints: {
      authorize: 'https://{tenant}.us.auth0.com/authorize'
    },
    samplePayload: {
      client_id: 'dcp_legacy_spa_client',
      response_type: 'id_token',
      response_mode: 'form_post',
      redirect_uri: 'https://displaycellpros.com/login/callback',
      scope: 'openid profile email',
      nonce: '6f8e7d6c5b4a3',
      state: 'session_state_123'
    },
    steps: [
      { step: 1, title: 'Authorize Request', from: 'Client Browser', to: 'Auth0 /authorize', detail: 'Requests response_type=id_token with response_mode=form_post.' },
      { step: 2, title: 'Form POST Response', from: 'Auth0', to: 'Client Callback', detail: 'Auth0 executes an HTTP POST directly to redirect_uri containing the signed ID token.' }
    ],
    documentationUrls: [
      { title: 'Implicit Flow with Form Post', url: 'https://auth0.com/docs/get-started/authentication-and-authorization-flow/implicit-flow-with-form-post' },
      { title: 'Authenticate SPAs with Cookies', url: 'https://auth0.com/docs/manage-users/cookies/spa-authenticate-with-cookies' }
    ]
  },
  {
    id: 'ropc_flow',
    name: 'Resource Owner Password Flow',
    badge: 'Legacy Direct Credentials',
    category: 'Advanced & Legacy',
    rfcOrStandard: 'OAuth 2.0 RFC 6749 §4.3 (ROPC)',
    description: 'Allows highly-trusted legacy applications to directly collect user credentials (username and password) and exchange them at /oauth/token. Should only be used when redirect-based flows are strictly impossible.',
    bestFor: 'Highly-trusted legacy internal migration tools where redirect UI cannot be rendered.',
    securityRating: 'Legacy / Caution',
    grantTypeOrResponseType: 'grant_type=password / grant_type=http://auth0.com/oauth/grant-type/password-realm',
    endpoints: {
      token: 'https://{tenant}.us.auth0.com/oauth/token'
    },
    samplePayload: {
      grant_type: 'password',
      username: 'tech_lead@displaycellpros.com',
      password: '************************',
      client_id: 'dcp_trusted_cli_client',
      client_secret: 'sec_legacy_9948201948',
      scope: 'openid profile email',
      audience: 'https://api.displaycellpros.com'
    },
    steps: [
      { step: 1, title: 'Direct Credentials Submission', from: 'Trusted App', to: 'Auth0 /oauth/token', detail: 'Application directly transmits user password and username to token endpoint.' },
      { step: 2, title: 'Credential Verification', from: 'Auth0 Database Connection', to: 'Auth0 Engine', detail: 'Auth0 validates password hash against tenant connection and brute-force protection.' },
      { step: 3, title: 'Token Issuance', from: 'Auth0', to: 'Trusted App', detail: 'Auth0 returns Access and ID tokens.' }
    ],
    documentationUrls: [
      { title: 'Resource Owner Password Flow', url: 'https://auth0.com/docs/get-started/authentication-and-authorization-flow/resource-owner-password-flow' },
      { title: 'Call API Using ROPC', url: 'https://auth0.com/docs/get-started/authentication-and-authorization-flow/resource-owner-password-flow/call-your-api-using-resource-owner-password-flow' }
    ]
  }
];

export default function Auth0FlowsHub() {
  const { showToast } = useToast();
  const [selectedFlowId, setSelectedFlowId] = useState<string>('auth_code');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [simulationStepIndex, setSimulationStepIndex] = useState<number>(-1);
  const [showDecisionWizard, setShowDecisionWizard] = useState(false);
  
  // Wizard state
  const [wizardAppType, setWizardAppType] = useState<string>('');
  const [wizardHasBackendSecret, setWizardHasBackendSecret] = useState<string>('');
  const [wizardNeedsSpecialPrivacy, setWizardNeedsSpecialPrivacy] = useState<string>('');

  const selectedFlow = auth0FlowsData.find(f => f.id === selectedFlowId) || auth0FlowsData[0];

  const categories = ['All', 'Standard Web & Mobile', 'Privacy & Enterprise', 'Machine & IoT', 'Advanced & Legacy'];

  const filteredFlows = activeCategory === 'All' 
    ? auth0FlowsData 
    : auth0FlowsData.filter(f => f.category === activeCategory);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimulationStepIndex(0);
    setSimulationLogs([`[INIT] Initializing Auth0 ${selectedFlow.name} handshake...`]);

    selectedFlow.steps.forEach((step, idx) => {
      setTimeout(() => {
        setSimulationStepIndex(idx);
        setSimulationLogs(prev => [
          ...prev, 
          `[STEP ${step.step}] ${step.title}: ${step.from} ➔ ${step.to} (${step.detail})`
        ]);
      }, (idx + 1) * 600);
    });

    setTimeout(() => {
      setSimulationStepIndex(selectedFlow.steps.length);
      setSimulationLogs(prev => [
        ...prev,
        `[CRYPTO] Verified tenant RS256 signature against https://{tenant}.us.auth0.com/.well-known/jwks.json`,
        `[SUCCESS] Issued JWT Access Token (aud: https://api.displaycellpros.com, exp: +86400s)`,
        `[SUCCESS] Issued ID Token with Verified User Claims (D&CP Master Tech / Ryan Young)`,
        `[COMPLETE] ${selectedFlow.name} execution completed successfully.`
      ]);
      setIsSimulating(false);
      showToast(`${selectedFlow.name} simulation executed successfully!`, 'success');
    }, (selectedFlow.steps.length + 1) * 600);
  };

  const calculateRecommendation = () => {
    if (wizardAppType === 'm2m') return 'client_credentials';
    if (wizardAppType === 'device') return 'device_auth';
    if (wizardAppType === 'ciba') return 'ciba';
    if (wizardAppType === 'cte') return 'custom_token_exchange';
    if (wizardNeedsSpecialPrivacy === 'yes') return 'rar_par_jar';
    if (wizardAppType === 'spa' || wizardAppType === 'mobile' || wizardHasBackendSecret === 'no') return 'pkce';
    if (wizardAppType === 'web' && wizardHasBackendSecret === 'yes') return 'auth_code';
    return 'auth_code';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Key className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-playfair font-black text-white">Auth0 Authentication & Authorization Flows</h2>
              <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold rounded-md border border-blue-500/30 uppercase">
                OIDC / OAuth 2.0
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Explore official protocols from Auth0 llms.txt: PKCE, RAR, PAR, JAR, CIBA, M2M, Device Flow & Token Exchange
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDecisionWizard(!showDecisionWizard)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
              showDecisionWizard 
                ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span>Which Flow Should I Use?</span>
          </button>
          
          <a
            href="https://auth0.com/llms.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-slate-700"
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Auth0 llms.txt</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Decision Wizard Modal / Banner */}
      <AnimatePresence>
        {showDecisionWizard && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-900 border border-blue-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-playfair font-bold text-lg text-white">Interactive Flow Decision Wizard</h3>
                  <p className="text-xs text-slate-400">Answer 3 quick architectural questions to determine the optimal OAuth 2.0 flow</p>
                </div>
              </div>
              <button
                onClick={() => setShowDecisionWizard(false)}
                className="text-xs text-slate-400 hover:text-white px-3 py-1 bg-slate-800 rounded-lg"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Question 1 */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-[11px] font-mono uppercase font-bold text-blue-400 block">1. Target Application Type</span>
                <select
                  value={wizardAppType}
                  onChange={(e) => setWizardAppType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-mono focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select App Type...</option>
                  <option value="web">Regular Web App (Server-side)</option>
                  <option value="spa">Single-Page App (React / Vue / Angular)</option>
                  <option value="mobile">Native Mobile App (iOS / Android)</option>
                  <option value="m2m">Machine-to-Machine / Daemon / CLI</option>
                  <option value="device">Smart TV / IoT / Input-Constrained</option>
                  <option value="ciba">Decoupled / POS / Call Center (CIBA)</option>
                  <option value="cte">Token Exchange / Legacy IDP Bridge</option>
                </select>
              </div>

              {/* Question 2 */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-[11px] font-mono uppercase font-bold text-blue-400 block">2. Can Store Secret Securely?</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setWizardHasBackendSecret('yes')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      wizardHasBackendSecret === 'yes' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Yes (Backend)
                  </button>
                  <button
                    onClick={() => setWizardHasBackendSecret('no')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      wizardHasBackendSecret === 'no' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    No (Public Client)
                  </button>
                </div>
              </div>

              {/* Question 3 */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-[11px] font-mono uppercase font-bold text-blue-400 block">3. Regulated / Financial Privacy?</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setWizardNeedsSpecialPrivacy('yes')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      wizardNeedsSpecialPrivacy === 'yes' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Yes (FAPI / RAR / PAR)
                  </button>
                  <button
                    onClick={() => setWizardNeedsSpecialPrivacy('no')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      wizardNeedsSpecialPrivacy === 'no' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Standard Scope
                  </button>
                </div>
              </div>
            </div>

            {/* Recommendation Result */}
            {wizardAppType && (
              <div className="p-4 bg-blue-950/40 border border-blue-500/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold">Recommended Flow:</span>
                  <div className="text-white font-playfair font-bold text-lg">
                    {auth0FlowsData.find(f => f.id === calculateRecommendation())?.name}
                  </div>
                  <p className="text-xs text-slate-300">
                    {auth0FlowsData.find(f => f.id === calculateRecommendation())?.bestFor}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedFlowId(calculateRecommendation());
                    setShowDecisionWizard(false);
                    showToast(`Selected ${auth0FlowsData.find(f => f.id === calculateRecommendation())?.name}`, 'info');
                  }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center gap-2 shrink-0"
                >
                  <span>Inspect This Flow</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCategory === category
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Main Grid: Flow Selector List & Detailed View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Flow Selector (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              Available Flows ({filteredFlows.length})
            </h3>
            <span className="text-[11px] font-mono text-slate-500">RFC Compliant</span>
          </div>

          <div className="space-y-2.5 max-h-[850px] overflow-y-auto pr-1">
            {filteredFlows.map((flow) => {
              const isSelected = selectedFlowId === flow.id;
              return (
                <button
                  key={flow.id}
                  onClick={() => setSelectedFlowId(flow.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-2 relative overflow-hidden ${
                    isSelected
                      ? 'bg-gradient-to-br from-blue-900/30 to-slate-900 border-blue-500/60 text-white shadow-lg shadow-blue-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm font-playfair text-white">{flow.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      flow.securityRating === 'Recommended' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      flow.securityRating === 'High Security' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                      flow.securityRating === 'Specialized' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                      'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {flow.securityRating}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-blue-400 font-semibold">{flow.badge}</span>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {flow.description}
                  </p>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>{flow.rfcOrStandard}</span>
                    <span className="text-slate-400 flex items-center gap-1">
                      {flow.steps.length} Steps
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Protocol Inspector & Live Sequence Simulation (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            {/* Top Bar of Selected Flow */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-playfair font-bold text-white">{selectedFlow.name}</h3>
                  <span className="text-xs font-mono px-2.5 py-0.5 bg-slate-800 text-blue-400 rounded-md border border-slate-700">
                    {selectedFlow.rfcOrStandard}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{selectedFlow.description}</p>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase border ${
                  selectedFlow.securityRating === 'Recommended' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                  selectedFlow.securityRating === 'High Security' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' :
                  selectedFlow.securityRating === 'Specialized' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                  'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {selectedFlow.securityRating}
                </span>
              </div>
            </div>

            {/* Best For Section */}
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-1">Optimal Architecture & Use Case:</span>
              <p className="text-slate-200">{selectedFlow.bestFor}</p>
            </div>

            {/* Sequence Flow Steps Visualizer */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Protocol Handshake Sequence ({selectedFlow.steps.length} Phases)
                </span>
                <span className="text-[11px] font-mono text-indigo-400">{selectedFlow.grantTypeOrResponseType}</span>
              </div>

              <div className="space-y-2.5">
                {selectedFlow.steps.map((step, idx) => {
                  const isCurrent = simulationStepIndex === idx;
                  const isPassed = simulationStepIndex > idx;
                  return (
                    <div
                      key={step.step}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isCurrent 
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                          : isPassed
                          ? 'bg-slate-950/80 border-emerald-500/30 text-slate-300'
                          : 'bg-slate-950 border-slate-800/80 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                            isCurrent ? 'bg-blue-500 text-white animate-pulse' :
                            isPassed ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {step.step}
                          </span>
                          <span className="font-bold text-white text-xs">{step.title}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                          <span className="text-blue-400">{step.from}</span>
                          <span>➔</span>
                          <span className="text-emerald-400">{step.to}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 pl-7 leading-relaxed">
                        {step.detail}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tenant Endpoints */}
            <div className="space-y-2.5">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                Auth0 OAuth Endpoints
              </span>
              <div className="space-y-1.5">
                {Object.entries(selectedFlow.endpoints).map(([key, url]) => (
                  <div key={key} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-blue-400 uppercase font-bold text-[11px]">{key}:</span>
                    <span className="text-slate-300 select-all truncate ml-2 text-[11px]">{url}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Request Payload JSON */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                  OAuth Protocol Request Payload
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(selectedFlow.samplePayload, null, 2));
                    showToast('Payload copied to clipboard!', 'success');
                  }}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy JSON</span>
                </button>
              </div>
              <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs font-mono text-amber-300 overflow-x-auto leading-relaxed max-h-56">
                {JSON.stringify(selectedFlow.samplePayload, null, 2)}
              </pre>
            </div>

            {/* Live Protocol Simulation & Telemetry */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-white">Live Protocol Simulation & Signature Verification</h4>
                  <p className="text-xs text-slate-400">Emulate end-to-end token acquisition and cryptographically signed JWT issuance</p>
                </div>
                <button
                  onClick={handleRunSimulation}
                  disabled={isSimulating}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 shrink-0 disabled:opacity-50"
                >
                  {isSimulating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Executing Handshake...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-white" />
                      <span>Simulate {selectedFlow.name}</span>
                    </>
                  )}
                </button>
              </div>

              {simulationLogs.length > 0 && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase text-slate-500 font-bold block">Execution Telemetry Stream</span>
                    <button
                      onClick={() => {
                        setSimulationLogs([]);
                        setSimulationStepIndex(-1);
                      }}
                      className="text-[10px] text-slate-500 hover:text-slate-300"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {simulationLogs.map((log, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-start gap-2 ${
                          log.includes('SUCCESS') ? 'text-emerald-400 font-bold' : 
                          log.includes('COMPLETE') ? 'text-blue-400 font-bold' : 
                          log.includes('CRYPTO') ? 'text-purple-400' :
                          log.includes('INIT') ? 'text-indigo-400' : 'text-slate-300'
                        }`}
                      >
                        <span className="shrink-0 text-slate-600">›</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Official Auth0 Documentation Links */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block">
                Official Auth0 Documentation References
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedFlow.documentationUrls.map((doc, idx) => (
                  <a
                    key={idx}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-slate-950 hover:bg-slate-850 rounded-xl border border-slate-800 hover:border-slate-700 text-xs font-bold text-blue-400 flex items-center justify-between transition-all group"
                  >
                    <span className="truncate group-hover:text-blue-300">{doc.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
