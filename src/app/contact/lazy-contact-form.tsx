'use client';
import dynamic from 'next/dynamic';
import { ContentLoading } from '@/components/content-loading';
export const LazyContactForm = dynamic(() => import('./contact-form').then(module => module.ContactForm), { loading: ContentLoading });
