
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/firebase';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Email không hợp lệ.' }),
  password: z.string().min(1, { message: 'Vui lòng nhập mật khẩu.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const DEFAULT_ADMIN_EMAIL = 'admin@vibary.com';

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    // For this demo, we allow any password for the admin email for simplicity,
    // but in a real app, you'd want to create this user in Firebase Auth.
    if (data.email !== DEFAULT_ADMIN_EMAIL) {
        toast({
            variant: 'destructive',
            title: 'Đăng nhập thất bại',
            description: 'Tài khoản này không phải là tài khoản quản trị.',
        });
        setIsLoading(false);
        return;
    }

    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({
        title: 'Đăng nhập thành công',
        description: 'Chào mừng trở lại, quản trị viên!',
      });
      router.push('/admin');
    } catch (error: any) {
        let description = 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.';
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            description = 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.';
        } else if (error.code === 'auth/too-many-requests') {
            description = 'Tài khoản đã bị tạm khóa do quá nhiều lần thử. Vui lòng thử lại sau.'
        }
       toast({
        variant: 'destructive',
        title: 'Đăng nhập thất bại',
        description: description,
      });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <Link href="/" className="inline-flex items-center justify-center gap-3 mb-4">
             <Image src="/logo.png" alt="Vibary Logo" width={40} height={40} />
            <span className="font-headline text-3xl font-bold tracking-widest text-foreground">
              VIBARY
            </span>
          </Link>
          <CardTitle className="text-2xl">Đăng Nhập Quản Trị</CardTitle>
          <CardDescription>
            Chỉ dành cho quản trị viên.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="admin@vibary.com"
                        {...field}
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                      <FormLabel>Mật khẩu</FormLabel>
                    </div>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} autoComplete="current-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Đăng nhập'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
