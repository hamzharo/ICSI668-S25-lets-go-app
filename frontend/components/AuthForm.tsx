// frontend/components/AuthForm.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import Link from 'next/link';
import Image from "next/image";
import CustomInput from './CustomInput'; // Ensure this component exists and works
import { authformSchema } from '@/lib/utils'; // Ensure this schema is correctly defined
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Use navigation router
import { toast } from 'react-toastify'; // Import toast
import 'react-toastify/dist/ReactToastify.css'; // Import toastify CSS
//  import './globals.css';

// --- Configuration (Replace with your actual values) ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'; // Your backend base URL
const LOGIN_ENDPOINT = '/api/auth/login';
const REGISTER_ENDPOINT = '/api/auth/register';
const AUTH_COOKIE_NAME = 'your_auth_token_cookie_name'; // <-- MUST match the name in middleware.ts!
// --- End Configuration ---


const AuthForm = ({ type }: { type: string }) => {

    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    // const pathname = usePathname(); // Not strictly needed anymore with middleware handling redirects

    // useEffect(() => {
    //     // Middleware should handle redirecting logged-in users away from login/register
    // }, []); // Keep useEffect minimal if middleware handles redirects

    const formSchema = authformSchema(type);

    // Define form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
            firstName: '',
            lastName: ''
        }
    });

    // Submit handler - Updated for backend integration
    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        let apiData;
        let apiUrl;

        // Prepare data and endpoint based on form type
        if (type === 'login') {
            apiData = { email: data.email, password: data.password };
            apiUrl = API_BASE_URL + LOGIN_ENDPOINT;
        } else if (type === 'register') {
            // Validate passwords match for registration
            if (data.password !== data.conPassword) {
                toast.error("Passwords do not match");
                setIsLoading(false);
                return;
            }
            // Prepare registration data (adjust fields based on your backend requirements)
            apiData = {
                firstName: data.firstName,
                lastName: data.lastName,
                emailId: data.email, // Assuming backend uses emailId
                password: data.password
                // Add any other required registration fields
            };
            apiUrl = API_BASE_URL + REGISTER_ENDPOINT;
        } else {
            console.error("Invalid form type specified:", type);
            toast.error("An unexpected error occurred.");
            setIsLoading(false);
            return; // Should not happen
        }

        try {
            // --- Make the API Call ---
            console.log(`Sending ${type} request to: ${apiUrl}`);
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiData),
            });

            // Attempt to parse JSON regardless of status code for potential error messages
            const result = await response.json();

            // --- Handle Response ---
            if (response.ok && result.token) { // Check for HTTP OK status and token in response
                console.log(`${type} successful, token received.`);

                // --- SET THE AUTH COOKIE ---
                const cookieValue = result.token;
                const daysToExpire = 7; // Example: 7-day expiry
                const expires = new Date(Date.now() + daysToExpire * 864e5).toUTCString();

                // Set the cookie (Ensure Secure flag is used in production with HTTPS)
                document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(cookieValue)}; expires=${expires}; path=/; SameSite=Lax`; // Add ; Secure in production
                console.log(`Cookie '${AUTH_COOKIE_NAME}' set.`);

                // Show success message
                toast.success(result.message || `${type === 'login' ? 'Login' : 'Registration'} successful!`);

                // --- REDIRECT AFTER setting cookie ---
                // Use replace to avoid login page in history stack
                router.replace('/'); // Redirect to home page

            } else {
                // Handle API errors (non-OK status or missing token)
                console.error(`${type} failed:`, result);
                toast.error(result.message || ` ${type === 'login' ? 'Login' : 'Registration'} failed. ${response.statusText}`);
            }

        } catch (error) {
            // Handle network errors or exceptions during fetch/JSON parsing
            console.error(`Error during ${type}:`, error);
            toast.error("An error occurred while connecting to the server. Please try again.");
        } finally {
            // Ensure loading state is turned off
            setIsLoading(false);
        }
    };

    return (
        <section className='auth-form'>
            <header className='flex flex-col gap-5 md:gap-8'>
                <div className="cursor-pointer flex items-center gap-1">
                    <Image
                        src="/icons/logo.png" // Ensure this path is correct relative to /public
                        width={72}
                        height={72}
                        alt="Let's logo"
                        priority
                    />
                    <h1 className="text-26 font-bold text-black-1">Let's GO</h1>
                </div>
                <div className='flex flex-col gap-1 md:gap-3'>
                    <h1 className='text-24 lg:text36 font-semibold text-gray-900'>
                        {type === 'login' ? 'Log In' : 'Sign Up'}
                        <p className='text-16 font-normal text-gray-600'>
                            Please enter your details
                        </p>
                    </h1>
                </div>
            </header>

            {/* Form rendering */}
            <Form {...form}>
                {/* Add novalidate to prevent default browser validation if using react-hook-form */}
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" noValidate>
                    {type === 'register' && (
                        <div className="flex gap-4">
                            {/* Ensure CustomInput forwards refs correctly if needed by react-hook-form */}
                            <CustomInput control={form.control} name="firstName" label="First Name" placeholder='Enter Your First Name' />
                            <CustomInput control={form.control} name="lastName" label="Last Name" placeholder='Enter Your Last Name' />
                        </div>
                    )}
                    <CustomInput control={form.control} name="email" label="Email" placeholder="Enter your email" />
                    <CustomInput control={form.control} name="password" label="Password" placeholder="Enter your password" />
                    {type === 'register' && (
                        <CustomInput control={form.control} name="conPassword" label="Confirm Password" placeholder="Re-enter your password" />
                    )}
                    <div className='flex flex-col gap-4'>
                        <Button type="submit" className='form-btn w-full' disabled={isLoading}> {/* Disable button when loading */}
                            {isLoading ? (
                                <div className='flex items-center justify-center gap-2'> {/* Center loading */}
                                    <Loader2 size={20} className='animate-spin' />
                                    <span>Processing...</span> {/* More generic loading text */}
                                </div>
                            ) : type === 'login' ? 'Log In' : 'Sign Up'}
                        </Button>
                    </div>
                </form>
            </Form>

            <footer className='flex justify-center gap-1 mt-4'> {/* Added margin-top */}
                <p className='text-14 font-normal text-gray-600'>
                    {type === 'login' ? 'Don\'t have an account?' : 'Already have an account?'}
                </p>
                <Link href={type === 'login' ? '/register' : '/login'} className='form-link'>
                    {type === 'login' ? 'Sign up' : 'Log in'}
                </Link>
            </footer>
        </section >
    );
};

export default AuthForm;