// export default function RootLayout({
//     children,
//   }: Readonly<{
//     children: React.ReactNode;
//   }>) {
//     return (
//       <main>
//           {children}
//       </main>
//     );
//   }
  

// frontend/app/layout.tsx

import React from 'react';
import { Metadata } from 'next';
import { Inter, IBM_Plex_Serif } from 'next/font/google';
import { ToastContainer } from 'react-toastify'; // Keep toast container if used globally
import 'react-toastify/dist/ReactToastify.css';
import '../globals.css'; // Keep global styles

// Keep font definitions
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-ibm-plex-serif'
});

// Keep metadata
export const metadata: Metadata = {
  title: "Let's GO",
  description: "Carpooling App",
  icons: {
    icon: '/icons/logo.png',
  },
};

// Minimal Root Layout component
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      {/* Apply font variables */}
      <body className={`${inter.variable} ${ibmPlexSerif.variable} antialiased`}>
        {/* Render children (which could be another layout or a page) */}
        {children}
        {/* Global Toast Container */}
        <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
        />
      </body>
    </html>
  );
}