// frontend/lib/auth/actions.ts
'use server';

import { User } from '@/types'; // Make sure User type is correctly imported
import { cookies } from 'next/headers';

// --- Your MOCK_verifySession and MOCK_getUserByIdFromDb functions ---
// (As provided in previous examples)
async function MOCK_verifySession(token: string | undefined): Promise<{ userId: string; roles: User['roles'] } | null> {
    // ... (implementation from previous response)
    if (token === 'valid-passenger-session-token') return { userId: 'passenger123', role: 'PASSENGER' };
    if (token === 'valid-driver-session-token') return { userId: 'driver789', roles: 'DRIVER'};
    return null;
}

async function MOCK_getUserByIdFromDb(userId: string, role: User['roles']): Promise<User | null> {
    // ... (implementation from previous response)
    if (userId === 'passenger123' && role.includes("PASSENGER")) return { id: 'passenger123', email: 'p@ex.com', firstName: 'Pass', role: 'PASSENGER' };
    if (userId === 'driver789' && role.includes("DRIVER")) return { id: 'driver789', email: 'd@ex.com', firstName: 'Driver', role: 'DRIVER' };
    return null;
}
// ---

export async function getCurrentUser(): Promise<User | null> {
  console.log("SERVER ACTION: getCurrentUser called");
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('session_token')?.value;

  if (!sessionToken) {
    console.log('getCurrentUser: No session token found.');
    return null;
  }
  const session = await MOCK_verifySession(sessionToken);
  if (!session || !session.userId) {
    console.log('getCurrentUser: Invalid session.');
    return null;
  }
  const user = await MOCK_getUserByIdFromDb(session.userId, session.roles);
  if (!user) {
    console.log(`getCurrentUser: User not found for ID: ${session.userId}`);
    return null;
  }
  console.log("getCurrentUser: User found - ", user.email, user.roles);
  return user;
}

// --- Mock Login/Logout Server Actions for testing cookies ---
export async function mockLoginAsPassenger() {
    cookies().set('session_token', 'valid-passenger-session-token', { path: '/', httpOnly: true, sameSite: 'lax' });
    return { success: true };
}
export async function mockLoginAsDriver() {
    cookies().set('session_token', 'valid-driver-session-token', { path: '/', httpOnly: true, sameSite: 'lax' });
    return { success: true };
}
export async function mockLogout() {
    cookies().delete('session_token');
    return { success: true };
}