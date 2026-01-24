'use client';

import { File, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { CustomerProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function CustomersPage() {
  const firestore = useFirestore();
  const customersCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'customers') : null),
    [firestore]
  );
  const { data: customers, isLoading } = useCollection<CustomerProfile>(customersCollection);

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          Khách hàng
        </h1>
        <div className="hidden items-center gap-2 md:ml-auto md:flex">
          <Button variant="outline" size="sm">
            <File className="mr-2 h-4 w-4" />
            Xuất file
          </Button>
          <Button size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm khách hàng
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Danh sách khách hàng</CardTitle>
          <CardDescription>
            Tổng hợp thông tin các khách hàng đã đăng ký.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Khách hàng</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">Số điện thoại</TableHead>
                <TableHead>Địa chỉ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-9 w-9 rounded-full" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                  </TableRow>
                ))}
              {customers?.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={customer.photoURL} alt="Avatar" />
                        <AvatarFallback>
                          {customer.firstName?.[0]}
                          {customer.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{customer.firstName} {customer.lastName}</div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{customer.email}</TableCell>
                  <TableCell className="hidden md:table-cell">{customer.phoneNumber}</TableCell>
                  <TableCell>{customer.address}</TableCell>
                </TableRow>
              ))}
               {!isLoading && customers?.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        Không có khách hàng nào.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Hiển thị <strong>{customers?.length ?? 0}</strong> trên{' '}
            <strong>{customers?.length ?? 0}</strong> khách hàng
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
