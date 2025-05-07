"use client";

import { sidebarLinks } from "@/constants"; // Import sidebar links from constants
import { cn } from "@/lib/utils"; // Utility function for classNames
import Image from "next/image"; // Image component from Next.js
import Link from "next/link"; // Link component from Next.js
import { usePathname } from "next/navigation"; // Hook to get the current path
import Footer from "./Footer"; // Footer component
import { SidebarProps } from "@/types"; // SidebarProps type definition

const Sidebar = ({ user }: SidebarProps) => {
    const pathName = usePathname(); // Get the current path name

    return (
        <section className="sidebar">
            <nav className="flex flex-col gap-4">
                {/* Logo and Navigation */}
                <Link href = '' className="mb-12 sm:mx-3 xl:mx-0 cursor-pointer flex items-center gap-2">
                    <Image
                        src="/icons/logo.png"
                        width={72}
                        height={72}
                        alt="Let's GO logo"
                        className="size-[50px] max-xl:size-14"
                    />
                    <h1 className="sidebar-logo">Let's GO</h1>
                </Link>
                {/* Sidebar Links */}
                {sidebarLinks.map((item) => {
                    const isActive = pathName === item.route || pathName.startsWith(`${item.route}/`); // Check if the current route is active
                    return (
                        <Link
                            className={cn('sidebar-link', {
                            })}
                            href={item.route}
                            key={item.label}
                        >
                            <div className="relative size-6">
                                <Image
                                    src={item.imgURL}
                                    alt={item.label}
                                    fill
                                    className={cn({
                                        'brightness-[3] invert-0': isActive, // Change icon style when active
                                    })}
                                />
                            </div>
                            <p className={cn("sidebar-label", {
                                "!text-white": isActive,  // Apply white text color when active
                            })}>
                                {item.label}
                            </p>
                        </Link>
                    );
                })}
                {/* Placeholder for user or any additional section */}
                USER
            </nav>
            <Footer user={user} />  {/* Pass user data to Footer */}
        </section>
    );
};

export default Sidebar;
