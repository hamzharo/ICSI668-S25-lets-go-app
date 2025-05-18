// frontend/lib/mockData/driverSupport.ts
import { FAQItem, SupportTicketDTO, SupportTicketFormValues } from '@/types';

export const mockDriverFAQs: FAQItem[] = [
  {
    id: 'faq1',
    question: 'How do I update my payout information?',
    answer: 'You can update your payout method and frequency in the "Settings" page under the "Payout Settings" section. For changes to bank account details, please contact support directly for security reasons.',
    category: 'Payments',
  },
  {
    id: 'faq2',
    question: 'What happens if a passenger cancels a ride last minute?',
    answer: 'Our cancellation policy outlines potential compensation for last-minute passenger cancellations. Please refer to the "Cancellation Policy" document in the Help section or contact support for specific cases.',
    category: 'Rides',
  },
  {
    id: 'faq3',
    question: 'How are service fees calculated?',
    answer: 'Service fees are a percentage of the ride fare. The exact percentage is detailed in your driver agreement and can also be found in the "Earnings" breakdown for each completed ride.',
    category: 'Payments',
  },
  {
    id: 'faq4',
    question: 'I\'m having trouble with the app. What should I do?',
    answer: 'First, try restarting the app and ensuring you have a stable internet connection. If the problem persists, check our "Known Issues" page (link to be added) or contact our technical support team using the form below, detailing the issue and your device type.',
    category: 'Technical',
  },
  {
    id: 'faq5',
    question: 'How can I improve my driver rating?',
    answer: 'Providing excellent service is key! This includes punctuality, vehicle cleanliness, safe driving, and friendly communication. After each ride, passengers have the option to rate their experience.',
    category: 'Account',
  },
];

// Mock API function to fetch FAQs (could filter by category in a real app)
export async function getMockDriverFAQs(token: string): Promise<FAQItem[]> {
  console.log(`[MOCK] Fetching driver FAQs with token: ${token}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(JSON.parse(JSON.stringify(mockDriverFAQs))); // Deep copy
    }, 500);
  });
}

// Mock API function to submit a support ticket
export async function submitMockSupportTicket(
  userId: string,
  userEmail: string,
  ticketData: SupportTicketFormValues,
  token: string
): Promise<SupportTicketDTO> {
  console.log(`[MOCK] Submitting support ticket for userId: ${userId} with token: ${token}`, ticketData);
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockResponse: SupportTicketDTO = {
        ticketId: `TICKET-${Date.now()}`,
        userId,
        userEmail,
        ...ticketData,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
      };
      resolve(mockResponse);
    }, 1000);
  });
}