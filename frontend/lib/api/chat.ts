// frontend/lib/api/chat.ts
import { ChatMessage, PassengerConversationPreview } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ... (getChatHistoryApi from previous response) ...

export async function getMyPassengerConversationsApi(token: string): Promise<PassengerConversationPreview[]> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }
  // --- MOCK IMPLEMENTATION ---
  console.log("[getMyPassengerConversationsApi] Fetching mock conversations...");
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          rideId: 'ride123',
          driverId: 'driver001',
          driverFirstName: 'John',
          driverLastName: 'Doe',
          driverProfilePictureUrl: 'https://avatar.vercel.sh/johndoe.png',
          rideDepartureCity: 'CityA',
          rideDestinationCity: 'CityB',
          rideDepartureTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
          lastMessageSnippet: 'See you soon!',
          lastMessageTimestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
          unreadCount: 1,
        },
        {
          rideId: 'ride456',
          driverId: 'driver002',
          driverFirstName: 'Jane',
          driverLastName: 'Smith',
          rideDepartureCity: 'CityX',
          rideDestinationCity: 'CityY',
          rideDepartureTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          lastMessageSnippet: 'Okay, sounds good.',
          lastMessageTimestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
          unreadCount: 0,
        },
      ]);
    }, 1200);
  });
  // --- END MOCK ---

  /* --- REAL IMPLEMENTATION (when backend is ready) ---
  const response = await fetch(`${BASE_URL}/api/chat/my-conversations`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  const responseText = await response.text();
  if (!response.ok) {
    let errorMsg = `API Error (${response.status}): ${response.statusText || 'Failed to fetch conversations.'}`;
    try {
      const errorDetails = JSON.parse(responseText);
      errorMsg = errorDetails.message || errorDetails.error || errorDetails.title || responseText || errorMsg;
    } catch (e) {
        errorMsg = responseText || errorMsg;
    }
    console.error("getMyPassengerConversationsApi error:", errorMsg);
    throw new Error(errorMsg);
  }
  try {
    return JSON.parse(responseText) as PassengerConversationPreview[];
  } catch (e) {
    console.error("Failed to parse conversations success response:", responseText, e);
    throw new Error("Received malformed conversation data from server.");
  }
  --- END REAL IMPLEMENTATION --- */
}