"use client";

export default function LoginButton() {
  return (
    <a
      href="/auth/login"
      className="w-full text-center inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-2xl text-[15px] tracking-[-0.01em] transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-px active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
    >
      Sign in with Auth0
    </a>
  );
}
