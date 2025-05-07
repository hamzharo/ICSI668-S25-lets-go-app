// frontend/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from '@/lib/AuthContext';
import { WebSocketProvider } from '@/lib/WebSocketContext'; // <--- IMPORT
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./globals.css";

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
          <WebSocketProvider> {/* <--- WRAP HERE */}
            {children}
            <ToastContainer
              position="top-right"
              autoClose={5000} // Increased duration for notifications
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </WebSocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}