"use client";

import React, { ReactNode, createContext, useContext, useMemo } from 'react';
import { Auth0Provider, useAuth0, User } from '@auth0/auth0-react';

interface Auth0ContextType {
  isConfigured: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  user?: User;
  loginWithRedirect: (options?: any) => Promise<void>;
  loginWithPopup: (options?: any) => Promise<void>;
  logout: (options?: any) => Promise<void>;
  getAccessTokenSilently: (options?: any) => Promise<string>;
}

const SafeAuth0Context = createContext<Auth0ContextType | null>(null);

export function isAuth0Configured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_AUTH0_DOMAIN &&
    process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID
  );
}

function ConfiguredAuth0Consumer({ children }: { children: ReactNode }) {
  const auth0 = useAuth0();

  const value = useMemo<Auth0ContextType>(() => ({
    isConfigured: true,
    isAuthenticated: auth0.isAuthenticated,
    isLoading: auth0.isLoading,
    user: auth0.user,
    loginWithRedirect: auth0.loginWithRedirect,
    loginWithPopup: auth0.loginWithPopup,
    logout: auth0.logout,
    getAccessTokenSilently: auth0.getAccessTokenSilently,
  }), [auth0]);

  return (
    <SafeAuth0Context.Provider value={value}>
      {children}
    </SafeAuth0Context.Provider>
  );
}

function FallbackAuth0Provider({ children }: { children: ReactNode }) {
  const value = useMemo<Auth0ContextType>(() => ({
    isConfigured: false,
    isAuthenticated: false,
    isLoading: false,
    user: undefined,
    loginWithRedirect: async () => {
      alert('Auth0 is not configured yet. Please add VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID in your environment.');
    },
    loginWithPopup: async () => {
      alert('Auth0 is not configured yet. Please add VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID in your environment.');
    },
    logout: async () => {},
    getAccessTokenSilently: async () => '',
  }), []);

  return (
    <SafeAuth0Context.Provider value={value}>
      {children}
    </SafeAuth0Context.Provider>
  );
}

interface Auth0ProviderWithConfigProps {
  children: ReactNode;
}

export function Auth0ProviderWithConfig({ children }: Auth0ProviderWithConfigProps) {
  const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
  const audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE || 'https://api.displaycellpros.com';

  if (!domain || !clientId) {
    return <FallbackAuth0Provider>{children}</FallbackAuth0Provider>;
  }

  const redirectUri = typeof window !== 'undefined' ? window.location.origin : undefined;

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        scope: 'openid profile email offline_access read:repairs write:repairs',
        ...(audience ? { audience } : {})
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      <ConfiguredAuth0Consumer>
        {children}
      </ConfiguredAuth0Consumer>
    </Auth0Provider>
  );
}

export function useSafeAuth0(): Auth0ContextType {
  const context = useContext(SafeAuth0Context);
  if (!context) {
    return {
      isConfigured: false,
      isAuthenticated: false,
      isLoading: false,
      user: undefined,
      loginWithRedirect: async () => {},
      loginWithPopup: async () => {},
      logout: async () => {},
      getAccessTokenSilently: async () => '',
    };
  }
  return context;
}
