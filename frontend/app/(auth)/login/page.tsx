// Example: frontend/app/(auth)/login/page.tsx
import AuthForm from '@/components/AuthForm'; // Adjust path if needed
import React from 'react';

const LoginPage = () => {
  return (
    <section className="flex-center size-full max-sm:px-6"> {/* Example centering class */}
      <AuthForm type="login" />
    </section>
  );
};
export default LoginPage;