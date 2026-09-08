'use client';
import dynamic from 'next/dynamic';
import { ContentLoading } from '@/components/content-loading';
export const LazyFlavorQuiz = dynamic(() => import('./flavor-quiz').then(module => module.FlavorQuiz), { loading: ContentLoading });
