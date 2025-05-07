// frontend/components/AuthForm.tsx

'use client';

import React, { useState } from 'react'; // Removed useEffect as it wasn't used
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import Link from 'next/link';
import Image from "next/image";
import CustomInput from './CustomInput';
import { authformSchema } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../app/globals.css';

// --- Configuration ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const LOGIN_ENDPOINT = '/api/auth/login';
const REGISTER_ENDPOINT = '/api/auth/register';
// ACTION (User): Ensure this AUTH_COOKIE_NAME matches .env.local, AuthContext.tsx, and middleware.ts
const AUTH_COOKIE_NAME = process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'your_auth_token_cookie_name';
// --- End Configuration ---


const AuthForm = ({ type }: { type: string }) => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const formSchema = authformSchema(type);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '', // Schema uses 'email'
            password: '',
            firstName: '',
            lastName: ''
        }
    });

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        let apiData;
        let apiUrl;

        if (type === 'login') {
            // ACTION: Changed to { email: data.email, password: data.password }
            apiData = { email: data.email, password: data.password };
            apiUrl = API_BASE_URL + LOGIN_ENDPOINT;
        } else if (type === 'register') {
            if (data.password !== data.conPassword) {
                toast.error("Passwords do not match");
                setIsLoading(false);
                return;
            }
            // ACTION: Changed to { ..., email: data.email, ... }
            apiData = {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email, // Changed from emailId
                password: data.password
            };
            apiUrl = API_BASE_URL + REGISTER_ENDPOINT;
        } else {
            console.error("Invalid form type specified:", type);
            toast.error("An unexpected error occurred.");
            setIsLoading(false);
            return;
        }

        try {
            console.log(`Sending ${type} request to: ${apiUrl} with data:`, apiData);
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiData),
            });

            const result = await response.json();

            // Response Handling: if (response.ok && result.token) -> GOOD
            if (response.ok && result.token) {
                console.log(`${type} successful, token received.`);
                const cookieValue = result.token;
                const daysToExpire = 7;
                const expires = new Date(Date.now() + daysToExpire * 864e5).toUTCString();

                let cookieString = `${AUTH_COOKIE_NAME}=${encodeURIComponent(cookieValue)}; expires=${expires}; path=/; SameSite=Lax`;
                if (process.env.NODE_ENV === 'production') {
                    cookieString += '; Secure';
                }
                document.cookie = cookieString;
                console.log(`Cookie '${AUTH_COOKIE_NAME}' set.`);

                // Use the message from backend if available, otherwise a generic success message
                toast.success(result.message || `${type === 'login' ? 'Login' : 'Registration'} successful!`);
                console.log("Attempting to redirect to / ..."); 
                router.replace('/');

            } else {
                console.error(`${type} failed with status ${response.status}:`, result);
                const errorMessage = result.message || result.error || result.detail || `${type === 'login' ? 'Login' : 'Registration'} failed. Please check your details or try again.`;
                toast.error(errorMessage);
            }

        } catch (error) {
            console.error(`Error during ${type}:`, error);
            toast.error("An error occurred while connecting to the server. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className='auth-form'>
            <header className='flex flex-col gap-5 md:gap-8'>
                <div className="cursor-pointer flex items-center gap-1">
                    <Image
                        src="/icons/logo.png"
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

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" noValidate>
                    {type === 'register' && (
                        <div className="flex gap-4">
                            <CustomInput control={form.control} name="firstName" label="First Name" placeholder='Enter Your First Name' />
                            <CustomInput control={form.control} name="lastName" label="Last Name" placeholder='Enter Your Last Name' />
                        </div>
                    )}
                    {/* Assuming your authformSchema and CustomInput use 'email' as the field name */}
                    <CustomInput control={form.control} name="email" label="Email" placeholder="Enter your email" />
                    <CustomInput control={form.control} name="password" label="Password" placeholder="Enter your password" />
                    {type === 'register' && (
                        <CustomInput control={form.control} name="conPassword" label="Confirm Password" placeholder="Re-enter your password" />
                    )}
                    <div className='flex flex-col gap-4'>
                        <Button type="submit" className='form-btn w-full' disabled={isLoading}>
                            {isLoading ? (
                                <div className='flex items-center justify-center gap-2'>
                                    <Loader2 size={20} className='animate-spin' />
                                    <span>Processing...</span>
                                </div>
                            ) : type === 'login' ? 'Log In' : 'Sign Up'}
                        </Button>
                    </div>
                </form>
            </Form>

            <footer className='flex justify-center gap-1 mt-4'>
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