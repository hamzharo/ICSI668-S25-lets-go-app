//frontend/app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      {/* You could add a logo or app name here if desired outside the AuthForm */}
      {children}
    </main>
  );
}