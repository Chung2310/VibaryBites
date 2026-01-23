'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth, useUser } from '@/firebase';

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
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const loginSchema = z.object({
  email: z.string().email({ message: 'Email không hợp lệ.' }),
  password: z.string().min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự.' }),
  rememberEmail: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberEmail: false,
    },
  });

  // Effect to load remembered email
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const rememberedEmail = localStorage.getItem('rememberedEmail');
      if (rememberedEmail) {
        form.setValue('email', rememberedEmail);
        form.setValue('rememberEmail', true);
      }
    }
  }, [form]);

  // Effect to redirect if user is already logged in
   useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        toast({ title: 'Đã đăng nhập', description: 'Đang chuyển hướng đến trang quản trị...' });
        router.push('/admin');
      } else {
        setIsInitializing(false);
      }
    }
  }, [user, isUserLoading, router, toast]);

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    
    if (typeof window !== 'undefined') {
      if (data.rememberEmail) {
          localStorage.setItem('rememberedEmail', data.email);
      } else {
          localStorage.removeItem('rememberedEmail');
      }
    }

    if (!auth) {
        toast({ variant: "destructive", title: "Lỗi", description: "Dịch vụ xác thực chưa sẵn sàng."});
        setIsLoading(false);
        return;
    }

    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({
        title: 'Đăng nhập thành công',
        description: 'Chào mừng trở lại, quản trị viên!',
      });
    } catch (error: any) {
        let description = 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.';
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
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

  if (isInitializing || isUserLoading) {
     return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
     )
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
            Sử dụng tài khoản được cấp để đăng nhập vào hệ thống.
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
                        placeholder="manager@vibary.com"
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
              <FormField
                control={form.control}
                name="rememberEmail"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                        <FormLabel className="font-normal">
                            Lưu tài khoản email
                        </FormLabel>
                    </div>
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
