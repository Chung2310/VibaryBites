
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This is a temporary redirect.
// The actual login page for admin will be at /admin/login.
export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/login');
  }, [router]);

  return null;
}
