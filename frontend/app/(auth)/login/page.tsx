// import AuthForm from '@/components/AuthForm'
// import React from 'react'

// const Login = () => {
//   return (
//     <section className="flex-center size-full max-sm:px-6">
//       <AuthForm type="login" />
//     </section>
//   )
// }

// export default Login

// frontend/app/(auth)/login/page.tsx

import AuthForm from '@/components/AuthForm'; // Your existing form component
import React from 'react';
import Link from 'next/link'; // For the "Sign up" link
import Image from 'next/image'; // Optional: if you want a logo/image in the info panel

const LoginPage = () => {
  return (
    // Main container using flex, ensuring it takes at least the screen height
    <section className="flex min-h-screen bg-gray-50"> {/* Light background for the page */}

      {/* Left Column (Informational Panel) */}
      {/* Hidden on screens smaller than 'lg', takes half width on 'lg' and up */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex-col justify-center items-center p-12 text-center relative">
        {/* Optional: You could add a background image pattern here */}

        <div className="max-w-md z-10"> {/* Ensure content is above background patterns */}
           {/* Optional Logo */}
           {/* <Image src="/icons/logo-white.png" width={80} height={80} alt="Logo" className="mb-6 mx-auto" /> */}

           <h1 className="text-4xl font-bold mb-4">Welcome Back!</h1>
           <p className="text-lg mb-8 leading-relaxed">
             Ready to hit the road? Log in to manage your shared rides, connect with fellow travelers, and keep the journey going.
           </p>
           {/* Link styled as a button */}
           <Link
             href="/register" // Link to your registration page
             className="inline-block bg-white text-blue-700 font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-gray-200 transition duration-300 ease-in-out transform hover:-translate-y-1"
           >
             Don't have an account? Sign up
           </Link>
        </div>
      </div>

      {/* Right Column (Login Form) */}
      {/* Takes full width on small screens, half width on 'lg' and up */}
      {/* Centers the AuthForm component */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-6 sm:p-10">
        {/* AuthForm component handles the actual form fields and logic */}
        {/* It likely has its own internal max-width for the form content */}
        <AuthForm type="login" />
      </div>

    </section>
  );
};

export default LoginPage;