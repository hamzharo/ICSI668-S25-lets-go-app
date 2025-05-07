import Image from 'next/image'
import React, { useState } from 'react'
import { RightSidebarProps } from '@/types'
import Link from 'next/link';


const RightSidebar = ({ user }: RightSidebarProps) => {
    const [profileImage, setProfileImage] = useState<string | null>(null)

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setProfileImage(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <aside className='right-sidebar w-80 bg-white p-6 shadow-lg h-screen sticky top-0'>
            <section className='flex flex-col pb-8'>
                {/* Profile Section - Supports personal information updates */}
                <div className='profile-banner h-32 bg-gray-200 rounded-t-lg relative' />
                <div className='profile px-4 -mt-12'>
                    <label className='profile-img block w-24 h-24 rounded-full border-4 border-white cursor-pointer relative'>
                        {profileImage ? (
                            <img
                                src={profileImage}
                                alt="Profile"
                                className='w-full h-full rounded-full object-cover'
                            />
                        ) : (
                            <span className='w-full h-full flex items-center justify-center text-5xl font-bold text-green-500 bg-gray-100 rounded-full'>
                                {user?.firstName[0]}
                            </span>
                        )}
                        {/* 
                            Profile Image Upload 
                            - Supports Use Case: Updating personal information (profile picture)
                        */}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="absolute opacity-0 w-full h-full top-0 left-0 cursor-pointer"
                            aria-label="Upload profile picture"
                        />
                    </label>
                    <div className='profile-details mt-4'>
                        <h1 className='profile-name text-2xl font-semibold text-gray-800'>
                            {user?.firstName} {user?.lastName}
                        </h1>
                        <p className='profile-email text-gray-600 text-sm'>
                            {user?.emailId}
                        </p>
                    </div>
                </div>
            </section>

            <section className='rides space-y-6'>
                {/* 
                    Use Case: Update Personal Information 
                    - Name, email, and contact details management
                */}
                <div className='menu-item group'>
                    <Link href='/RightSidebarItems/edit-profile' className='flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors'>
                        <h2 className='text-lg font-medium text-gray-700'>Edit Profile</h2>
                        <Image
                            src='/icons/edit-profile.png'
                            width={20}
                            height={20}
                            alt='Edit profile'
                            className='opacity-70 group-hover:opacity-100'
                        />
                    </Link>
                </div>

                {/* 
                    Use Case: Complete Account Setup 
                    - Email verification, payment details, and activation requirements
                */}
                <div className='menu-item group'>
                    <Link href='/RightSidebarItems/complete-account' className='flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors'>
                        <h2 className='text-lg font-medium text-gray-700'>Complete account</h2>
                        <Image
                            src='/icons/complete-account.png'
                            width={20}
                            height={20}
                            alt='Complete account'
                            className='opacity-70 group-hover:opacity-100'
                        />
                    </Link>
                </div>

                {/* 
                    Use Case: Document Submission (KYC/Verification) 
                    - Identity proof, address verification, and compliance documents
                */}
                <div className='menu-item group'>
                    <Link href='/RightSidebarItems/upload-documents' className='flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors'>
                        <h2 className='text-lg font-medium text-gray-700'>Upload documents</h2>
                        <Image
                            src='/icons/upload.png'
                            width={20}
                            height={20}
                            alt='Upload documents'
                            className='opacity-70 group-hover:opacity-100'
                        />
                    </Link>
                </div>

                {/* 
                    Use Case: Settings & Support Management 
                    - Notification preferences, security settings, and support access
                */}
                <div className='menu-item group'>
                    <Link href='/RightSidebarItems/settings-support' className='flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors'>
                        <h2 className='text-lg font-medium text-gray-700'>Settings & Support</h2>
                        <Image
                            src='/icons/setting-support.png'
                            width={20}
                            height={20}
                            alt='Settings and support'
                            className='opacity-70 group-hover:opacity-100'
                        />
                    </Link>
                </div>
            </section>
        </aside>
    )
}

export default RightSidebar