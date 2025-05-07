// Example: frontend/app/(auth)/register/page.tsx
import AuthForm from '@/components/AuthForm'; // Adjust path if needed
import React from 'react';

const RegisterPage = () => {
  return (
    <section className="flex-center size-full max-sm:px-6"> {/* Example centering class */}
      <AuthForm type="register" />
    </section>
  );
};
export default RegisterPage;