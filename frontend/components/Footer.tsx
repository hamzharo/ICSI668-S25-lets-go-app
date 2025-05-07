import Image from 'next/image';
import React from 'react';
import { FooterProps } from '@/types';

const Footer = ({ user, type = 'desktop' }: FooterProps) => {

    // Simulate logout functionality (no actual API call)
    const handleLogout = () => {
        // For now, simulate the logout process
        console.log("User logged out");
        // Redirect to login page (simulated)
        window.location.href = "/login";
    };

    return (
        <footer className="footer">
            <div className={type === 'mobile' ? 'footer_name-mobile' : 'footer_name'}>
                <p className="text-xl font-bold text-gray-700">
                    {user?.firstName ? user.firstName[0] : 'U'}
                </p>
            </div>

            <div className={type === 'mobile' ? 'footer_email-mobile' : 'footer_email'}>
                <h1 className="text-14 truncate text-gray-700 font-semibold">
                    {user?.firstName || 'User Name'}
                </h1>
                <p className="text-xs truncate font-normal text-gray-600">
                    {user?.emailId || 'user@example.com'}
                </p>
            </div>

            <div className='ml-5' onClick={handleLogout}>
                <Image width={25} height={25} src="icons/logout.svg" alt="logout" />
            </div>
        </footer>
    );
};

export default Footer;
