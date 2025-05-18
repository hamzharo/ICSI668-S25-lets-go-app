'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    HelpCircle,     // For FAQs
    Mail,           // For Email Contact
    Phone,          // For Phone Contact
    MessageSquare,  // For Live Chat (or general contact)
    FileText,       // For Help Articles
} from 'lucide-react';
import Link from 'next/link';

// Mock FAQ data
const faqs = [
    {
        id: 'faq1',
        question: 'How do I book a ride?',
        answer: 'You can book a ride by navigating to the "Find a Ride" section, entering your destination and pickup location, and selecting an available ride. Follow the prompts to confirm your booking.',
    },
    {
        id: 'faq2',
        question: 'How do I cancel a booking?',
        answer: 'Go to "My Bookings", find the ride you wish to cancel, and look for a "Cancel Booking" option. Please note that cancellation policies may apply.',
    },
    {
        id: 'faq3',
        question: 'What payment methods are accepted?',
        answer: 'We accept various payment methods including major credit/debit cards and sometimes digital wallets. You can manage your payment methods in the "Payment Methods" section of your profile (if available).',
    },
    {
        id: 'faq4',
        question: 'How do I report an issue with a ride or driver?',
        answer: 'If you experience any issues, please use the "Report an Issue" feature within your ride details in "My Bookings" or contact our support team directly through the methods listed on this page.',
    },
    {
        id: 'faq5',
        question: 'How can I become a driver?',
        answer: 'If you are interested in becoming a driver, please look for the "Become a Driver" link in the main navigation menu. This will guide you through the application process.',
    },
];

// Mock contact form state
interface ContactFormState {
    name: string;
    email: string;
    subject: string;
    message: string;
}

const initialContactFormState: ContactFormState = {
    name: '',
    email: '',
    subject: '',
    message: '',
};

const PassengerSupportContent = () => {
    const [contactForm, setContactForm] = useState<ContactFormState>(initialContactFormState);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setContactForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitContactForm = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock submission
        console.log('Contact form submitted (mock):', contactForm);
        setIsSubmitted(true);
        setContactForm(initialContactFormState); // Reset form
        // In a real app, you'd send this data to your backend
        setTimeout(() => setIsSubmitted(false), 5000); // Hide message after 5 seconds
    };

    return (
        <div className="space-y-8 max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Passenger Support</h1>
            <p className="text-lg text-muted-foreground">
                Need help? Find answers to common questions or get in touch with our support team.
            </p>

            {/* FAQs Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <HelpCircle className="mr-2 h-5 w-5" />
                        Frequently Asked Questions (FAQs)
                    </CardTitle>
                    <CardDescription>Find quick answers to common questions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq) => (
                            <AccordionItem value={faq.id} key={faq.id}>
                                <AccordionTrigger className="text-left hover:no-underline">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>

            {/* Contact Us Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <MessageSquare className="mr-2 h-5 w-5" />
                        Contact Us
                    </CardTitle>
                    <CardDescription>
                        If you can't find an answer in the FAQs, feel free to reach out.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center">
                            <Mail className="mr-2 h-5 w-5 text-primary" /> Send us an Email
                        </h3>
                        <p className="text-muted-foreground">
                            For general inquiries or support requests, email us at:
                            <Button variant="link" asChild className="px-1 py-0 h-auto">
                                <a href="mailto:support@example.com">support@example.com</a>
                            </Button>
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center">
                            <Phone className="mr-2 h-5 w-5 text-primary" /> Call Us
                        </h3>
                        <p className="text-muted-foreground">
                            Speak to a support agent (Mon-Fri, 9am-5pm):
                            <Button variant="link" asChild className="px-1 py-0 h-auto">
                                <a href="tel:+1234567890">+1 (234) 567-890</a>
                            </Button>
                        </p>
                    </div>

                    <form onSubmit={handleSubmitContactForm} className="space-y-4 pt-4 border-t">
                        <h3 className="text-md font-semibold">Or, send a message directly:</h3>
                        {isSubmitted && (
                            <div className="p-3 bg-green-100 text-green-700 border border-green-300 rounded-md text-sm">
                                Thank you for your message! We'll get back to you soon (this is a mock submission).
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="name">Your Name</Label>
                                <Input id="name" name="name" value={contactForm.name} onChange={handleInputChange} placeholder="John Doe" required />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="email">Your Email</Label>
                                <Input id="email" name="email" type="email" value={contactForm.email} onChange={handleInputChange} placeholder="you@example.com" required />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="subject">Subject</Label>
                            <Input id="subject" name="subject" value={contactForm.subject} onChange={handleInputChange} placeholder="e.g., Issue with booking #12345" required />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" name="message" value={contactForm.message} onChange={handleInputChange} placeholder="Describe your issue or question in detail..." rows={5} required />
                        </div>
                        <Button type="submit" className="w-full sm:w-auto">Send Message</Button>
                    </form>
                </CardContent>
            </Card>

            {/* Additional Help Resources (Optional) */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <FileText className="mr-2 h-5 w-5" />
                        Helpful Articles
                    </CardTitle>
                    <CardDescription>Explore our guides and tutorials.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Link href="/help/getting-started" className="flex items-center text-primary hover:underline">
                        <FileText className="mr-2 h-4 w-4" /> Getting Started Guide
                    </Link>
                    <Link href="/help/safety-tips" className="flex items-center text-primary hover:underline">
                        <FileText className="mr-2 h-4 w-4" /> Passenger Safety Tips
                    </Link>
                    <Link href="/help/understanding-fares" className="flex items-center text-primary hover:underline">
                        <FileText className="mr-2 h-4 w-4" /> Understanding Fares and Payments
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
};

export default PassengerSupportContent;