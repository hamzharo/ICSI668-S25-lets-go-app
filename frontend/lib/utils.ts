// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable no-prototype-builtins */

// import { type ClassValue, clsx } from "clsx";
// import { twMerge } from "tailwind-merge";
// import { z } from "zod";

// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs));
// }

// // FORMAT DATE TIME
// export const formatDateTime = (dateString: Date) => {
//   const dateTimeOptions: Intl.DateTimeFormatOptions = {
//     weekday: "short", // abbreviated weekday name (e.g., 'Mon')
//     month: "short", // abbreviated month name (e.g., 'Oct')
//     day: "numeric", // numeric day of the month (e.g., '25')
//     hour: "numeric", // numeric hour (e.g., '8')
//     minute: "numeric", // numeric minute (e.g., '30')
//     hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
//   };

//   const dateDayOptions: Intl.DateTimeFormatOptions = {
//     weekday: "short", // abbreviated weekday name (e.g., 'Mon')
//     year: "numeric", // numeric year (e.g., '2023')
//     month: "2-digit", // abbreviated month name (e.g., 'Oct')
//     day: "2-digit", // numeric day of the month (e.g., '25')
//   };

//   const dateOptions: Intl.DateTimeFormatOptions = {
//     month: "short", // abbreviated month name (e.g., 'Oct')
//     year: "numeric", // numeric year (e.g., '2023')
//     day: "numeric", // numeric day of the month (e.g., '25')
//   };

//   const timeOptions: Intl.DateTimeFormatOptions = {
//     hour: "numeric", // numeric hour (e.g., '8')
//     minute: "numeric", // numeric minute (e.g., '30')
//     hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
//   };

//   const formattedDateTime: string = new Date(dateString).toLocaleString(
//     "en-US",
//     dateTimeOptions
//   );

//   const formattedDateDay: string = new Date(dateString).toLocaleString(
//     "en-US",
//     dateDayOptions
//   );

//   const formattedDate: string = new Date(dateString).toLocaleString(
//     "en-US",
//     dateOptions
//   );

//   const formattedTime: string = new Date(dateString).toLocaleString(
//     "en-US",
//     timeOptions
//   );

//   return {
//     dateTime: formattedDateTime,
//     dateDay: formattedDateDay,
//     dateOnly: formattedDate,
//     timeOnly: formattedTime,
//   };
// };

// export function formatAmount(amount: number): string {
//   const formatter = new Intl.NumberFormat("en-US", {
//     style: "currency",
//     currency: "USD",
//     minimumFractionDigits: 2,
//   });

//   return formatter.format(amount);
// }

// export const removeSpecialCharacters = (value: string) => {
//   return value.replace(/[^\w\s]/gi, "");
// };

// interface UrlQueryParams {
//   params: string;
//   key: string;
//   value: string;
// }





// export const authformSchema = (type: string) => z.object({
//   email: z.string().email(),
//   password: z.string().min(8),
//   firstName: type === 'login' ? z.string().optional() : z.string().min(3),
//   lastName: type === 'login' ? z.string().optional() : z.string().min(3),
//   conPassword: type === 'login' ? z.string().optional() : z.string().min(8)
// })


/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-prototype-builtins */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import { loginResponse } from "@/types"; // Assuming loginResponse type is needed by getLoggedInUser

// --- Placeholder for getLoggedInUser ---
// !!! IMPORTANT: Replace this with your ACTUAL getLoggedInUser function !!!
// This function likely interacts with localStorage, sessionStorage, or cookies
// Make sure any direct access to browser APIs (like localStorage) happens
// ONLY inside useEffect or event handlers in your components, NOT at the top level here.
export const getLoggedInUser = (): loginResponse | null => {
  console.warn(
    "Using placeholder getLoggedInUser function in lib/utils.ts. Replace with actual implementation."
  );
  // --- YOUR ACTUAL LOGIC GOES HERE ---
  // Example (IF using localStorage, but be careful where you call this):
  // try {
  //   const userData = localStorage.getItem('loggedInUser');
  //   return userData ? JSON.parse(userData) : null;
  // } catch (error) {
  //   console.error("Error getting user from localStorage", error);
  //   return null;
  // }
  // --- END OF YOUR ACTUAL LOGIC ---

  // Return null as a default placeholder
  return null;
};
// --- End of Placeholder ---

// --- Placeholder for request ---
// !!! IMPORTANT: Replace this with your ACTUAL request function !!!
// This function likely uses fetch or axios to make API calls.
// Ensure baseURLs, headers, and error handling are correct.
export const request = async (
  method: string,
  url: string,
  data?: any
): Promise<any> => {
  console.warn(
    "Using placeholder request function in lib/utils.ts. Replace with actual implementation."
  );
  // --- YOUR ACTUAL LOGIC GOES HERE ---
  // Example using fetch:
  // const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'; // Example base URL
  // const headers: HeadersInit = {
  //   'Content-Type': 'application/json',
  //   // Add authorization headers if needed, e.g., from getLoggedInUser()
  // };
  // try {
  //   const response = await fetch(`${baseURL}${url}`, {
  //     method: method.toUpperCase(),
  //     headers,
  //     body: data ? JSON.stringify(data) : null,
  //   });
  //   if (!response.ok) {
  //     // Handle HTTP errors (e.g., response.status)
  //     const errorData = await response.json().catch(() => ({ message: response.statusText }));
  //     throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  //   }
  //   // Assuming your API always returns JSON
  //   return await response.json();
  // } catch (error) {
  //   console.error("API request failed:", error);
  //   throw error; // Re-throw the error to be caught by the caller
  // }
  // --- END OF YOUR ACTUAL LOGIC ---

  // Return a resolved promise with null as a default placeholder
  return Promise.resolve(null);
};
// --- End of Placeholder ---

// --- Your existing utility functions ---

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// FORMAT DATE TIME
export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    month: "short", // abbreviated month name (e.g., 'Oct')
    day: "numeric", // numeric day of the month (e.g., '25')
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };

  const dateDayOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    year: "numeric", // numeric year (e.g., '2023')
    month: "2-digit", // abbreviated month name (e.g., 'Oct')
    day: "2-digit", // numeric day of the month (e.g., '25')
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // numeric year (e.g., '2023')
    day: "numeric", // numeric day of the month (e.g., '25')
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };

  const formattedDateTime: string = new Date(dateString).toLocaleString(
    "en-US",
    dateTimeOptions
  );

  const formattedDateDay: string = new Date(dateString).toLocaleString(
    "en-US",
    dateDayOptions
  );

  const formattedDate: string = new Date(dateString).toLocaleString(
    "en-US",
    dateOptions
  );

  const formattedTime: string = new Date(dateString).toLocaleString(
    "en-US",
    timeOptions
  );

  return {
    dateTime: formattedDateTime,
    dateDay: formattedDateDay,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};

export function formatAmount(amount: number): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

  return formatter.format(amount);
}

export const removeSpecialCharacters = (value: string) => {
  return value.replace(/[^\w\s]/gi, "");
};

interface UrlQueryParams {
  params: string;
  key: string;
  value: string;
}

export const authformSchema = (type: string) =>
  z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: type === "login" ? z.string().optional() : z.string().min(3),
    lastName: type === "login" ? z.string().optional() : z.string().min(3),
    conPassword: type === "login" ? z.string().optional() : z.string().min(8),
  });

// --- End of your existing utility functions ---