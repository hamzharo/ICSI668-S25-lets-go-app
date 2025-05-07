// frontend/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from '@/lib/AuthContext';
import { ToastContainer } from 'react-toastify'; // Or your preferred toast library
import 'react-toastify/dist/ReactToastify.css';
import "./globals.css"; // Your global styles

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Let's GO App",
  description: "Car Sharing Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
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
            theme="light" // Or "dark" or "colored"
          />
        </AuthProvider>
      </body>
    </html>
  );
}