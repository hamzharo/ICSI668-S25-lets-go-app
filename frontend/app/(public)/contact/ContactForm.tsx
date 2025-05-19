// frontend/app/(public)/contact/ContactForm.tsx
"use client"; // Mark this component as a Client Component

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send } from 'lucide-react'; // Icon used in the button

const ContactForm = () => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    alert("Thank you for your message! (This is a demo, no email was actually sent). We'll get back to you soon.");
    // Optionally reset the form
    if (event.target instanceof HTMLFormElement) {
        event.target.reset();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
          <Input id="name" name="name" type="text" placeholder="Your Name (e.g., Jane Doe)" required className="mt-1"/>
        </div>
        <div>
          <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required className="mt-1"/>
        </div>
      </div>
      <div>
        <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
        <Input id="subject" name="subject" type="text" placeholder="e.g., Question about rides" required className="mt-1"/>
      </div>
      <div>
        <Label htmlFor="message" className="text-sm font-medium">Message</Label>
        <Textarea id="message" name="message" placeholder="Your detailed message here..." required rows={5} className="mt-1"/>
      </div>
      <div>
        <Button type="submit" size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90">
          <Send className="mr-2 h-4 w-4"/> Send Message 
        </Button>
      </div>
    </form>
  );
};

export default ContactForm;