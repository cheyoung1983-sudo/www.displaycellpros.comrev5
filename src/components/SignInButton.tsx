"use client";

import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function SignInButton() {
  const { loginWithRedirect } = useAuth0();

  const onClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      if (typeof window !== 'undefined' && window.grecaptcha && window.grecaptcha.enterprise) {
        await new Promise<void>((resolve) => {
          window.grecaptcha.enterprise.ready(async () => {
            const token = await window.grecaptcha.enterprise.execute('6LcB60UtAAAAAEk-ADlBMnuUjbWXddXTyXLcmoSj', { action: 'LOGIN' });
            console.log('reCAPTCHA enterprise token generated:', token);
            loginWithRedirect();
            resolve();
          });
        });
      } else {
        loginWithRedirect();
      }
    } catch (err) {
      console.error("Failed to initiate sign-in:", err);
      loginWithRedirect();
    }
  };

  return (
    <button
      className="g-recaptcha rounded bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      data-sitekey="6LcB60UtAAAAAEk-ADlBMnuUjbWXddXTyXLcmoSj"
      data-callback="onSubmit"
      data-action="submit"
      onClick={onClick}
    >
      Sign In
    </button>
  );
}

