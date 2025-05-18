// frontend/app/(root)/driver/profile-settings/support/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { FAQItem, SupportTicketFormValues } from '@/types'; // Ensure these types are defined in @/types
import { getMockDriverFAQs, submitMockSupportTicket } from '@/lib/mockData/driverSupport'; // Ensure mock files exist

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
// CORRECTED IMPORT FOR CARD COMPONENTS:
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, HelpCircle, Send, Mail, Phone, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

// Zod Schema for Support Ticket Form
const supportTicketSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters long.").max(100, "Subject is too long."),
  category: z.enum(['Billing', 'Technical Issue', 'Ride Dispute', 'Account Question', 'Feedback', 'Other'], {
    required_error: "Please select a category.",
  }),
  message: z.string().min(20, "Message must be at least 20 characters long.").max(2000, "Message is too long."),
});

export default function DriverSupportPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [isLoadingFAQs, setIsLoadingFAQs] = useState(true);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [activeFAQCategory, setActiveFAQCategory] = useState<FAQItem['category'] | 'All'>('All');

  const { control, handleSubmit, reset, formState: { errors } } = useForm<SupportTicketFormValues>({
    resolver: zodResolver(supportTicketSchema),
    defaultValues: {
      subject: '',
      category: 'Other', // Default category
      message: '',
    }
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user || !token) {
        toast.error("You must be logged in to access support.");
        router.push('/login'); // Adjust to your login route
        return;
      }
      const fetchFAQsData = async () => {
        setIsLoadingFAQs(true);
        try {
          const faqsData = await getMockDriverFAQs(token); 
          setFaqs(faqsData);
        } catch (error) {
          console.error("Failed to load FAQs:", error);
          toast.error("Could not load FAQs. Please try again later.");
        } finally {
          setIsLoadingFAQs(false);
        }
      };
      fetchFAQsData();
    }
  }, [user, token, authLoading, router]);

  const onTicketSubmit: SubmitHandler<SupportTicketFormValues> = async (data) => {
    if (!user || !token) {
      toast.error("Authentication error. Cannot submit ticket.");
      return;
    }
    setIsSubmittingTicket(true);
    try {
      const result = await submitMockSupportTicket(user.id, user.email, data, token);
      toast.success(`Support ticket #${result.ticketId} submitted successfully! We'll get back to you soon.`);
      reset(); 
    } catch (error: any) {
      console.error("Failed to submit support ticket:", error);
      toast.error(error.message || "Failed to submit support ticket. Please try again.");
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  const faqCategories = ['All', ...new Set(faqs.map(faq => faq.category))] as const;
  const filteredFAQs = activeFAQCategory === 'All' ? faqs : faqs.filter(faq => faq.category === activeFAQCategory);

  if (authLoading) {
    return (
      <div className="flex flex-grow items-center justify-center p-10 min-h-[calc(100vh-150px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading support page...</p>
      </div>
    );
  }
  
  if (!user) {
    return <div className="p-10 text-center">Redirecting to login...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-10">
      <header className="text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">Driver Support Center</h1>
        <p className="text-lg text-muted-foreground">Find answers to your questions or get in touch with our team.</p>
      </header>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <HelpCircle className="mr-3 h-7 w-7 text-primary" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Quick answers to common driver queries.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingFAQs ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3">Loading FAQs...</span>
            </div>
          ) : (
            <>
              <div className="mb-6 flex flex-wrap gap-2">
                {faqCategories.map(category => (
                  <Button
                    key={category}
                    variant={activeFAQCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFAQCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
              {filteredFAQs.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {filteredFAQs.map((faq) => (
                    <AccordionItem value={faq.id} key={faq.id}>
                      <AccordionTrigger className="text-left hover:no-underline text-base">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="prose dark:prose-invert max-w-none text-muted-foreground text-sm pb-4">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                 <p className="text-muted-foreground text-center py-5">No FAQs found for this category.</p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Contact Support Form Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <Send className="mr-3 h-7 w-7 text-primary" />
            Contact Support
          </CardTitle>
          <CardDescription>Can't find an answer? Send us a message, and we'll get back to you.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onTicketSubmit)}>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="subject" className="font-medium">Subject</Label>
              <Controller
                name="subject"
                control={control}
                render={({ field }) => (
                  <Input id="subject" {...field} placeholder="e.g., Issue with payout calculation" />
                )}
              />
              {errors.subject && <p className="text-sm text-red-600 mt-1">{errors.subject.message}</p>}
            </div>
            <div>
              <Label htmlFor="category" className="font-medium">Category</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <SelectTrigger id="category" aria-label="Support Category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Billing">Billing & Payouts</SelectItem>
                      <SelectItem value="Technical Issue">Technical Issue</SelectItem>
                      <SelectItem value="Ride Dispute">Ride Dispute</SelectItem>
                      <SelectItem value="Account Question">Account Question</SelectItem>
                      <SelectItem value="Feedback">Feedback & Suggestions</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>}
            </div>
            <div>
              <Label htmlFor="message" className="font-medium">Your Message</Label>
              <Controller
                name="message"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="message"
                    {...field}
                    placeholder="Please describe your issue or question in detail..."
                    rows={6}
                    className="min-h-[120px]"
                  />
                )}
              />
              {errors.message && <p className="text-sm text-red-600 mt-1">{errors.message.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6"> {/* This line was causing the error if CardFooter wasn't imported */}
            <Button type="submit" disabled={isSubmittingTicket} size="lg">
              {isSubmittingTicket && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Ticket
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Separator />

      {/* Other Contact Methods */}
       <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Other Ways to Reach Us</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center text-muted-foreground">
                <Mail className="mr-3 h-5 w-5 text-primary shrink-0" />
                <span>Email Support: <a href="mailto:driversupport@example.com" className="text-primary hover:underline">driversupport@example.com</a></span>
            </div>
             <div className="flex items-center text-muted-foreground">
                <Phone className="mr-3 h-5 w-5 text-primary shrink-0" />
                <span>Phone (Mon-Fri, 9am-5pm): <a href="tel:+18001234567" className="text-primary hover:underline">+1-800-123-4567</a></span>
            </div>
            <p className="text-xs text-muted-foreground">Please have your driver ID or email ready if contacting by phone or email.</p>
        </CardContent>
      </Card>

    </div>
  );
}