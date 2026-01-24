'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { uploadImage } from '@/firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function NewProductPage() {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setImageFile(event.target.files[0]);
        }
    };

    const handleUploadTest = async () => {
        if (!imageFile) {
            alert("Vui lòng chọn một file ảnh để kiểm tra.");
            return;
        }

        setIsUploading(true);
        try {
            console.log("Bắt đầu tải ảnh lên...");
            const downloadURL = await uploadImage(imageFile);
            console.log("Tải ảnh lên thành công! URL:", downloadURL);
            alert(`Tải ảnh lên thành công! URL của ảnh là: ${downloadURL}`);
        } catch (error) {
            console.error("LỖI KHI TẢI ẢNH:", error);
            alert(`Đã xảy ra lỗi khi tải ảnh lên. Vui lòng kiểm tra Console (F12) để xem chi tiết lỗi. \n\nLỗi: ${(error as Error).message}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Kiểm Tra Chức Năng Tải Ảnh Lên Firebase Storage</CardTitle>
                    <CardDescription>
                        Trang này đã được tạm thời thay đổi để chẩn đoán sự cố tải ảnh. Vui lòng chọn một file ảnh và nhấn nút "Bắt đầu Tải lên" để kiểm tra.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label htmlFor="image-upload" className="font-medium">Bước 1: Chọn ảnh</label>
                        <Input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} className="mt-2" />
                    </div>
                    
                    <Button onClick={handleUploadTest} disabled={isUploading || !imageFile}>
                        {isUploading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải...</>
                        ) : (
                            'Bước 2: Bắt đầu Tải lên'
                        )}
                    </Button>

                     <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-sm">
                        <p className="font-bold">Hướng dẫn:</p>
                        <ol className="list-decimal list-inside mt-2 space-y-1">
                            <li>Mở Developer Tools (nhấn F12).</li>
                            <li>Chuyển sang tab "Console".</li>
                            <li>Chọn một file ảnh bất kỳ.</li>
                            <li>Nhấn nút "Bắt đầu Tải lên".</li>
                            <li>Cung cấp lại cho tôi thông báo trong hộp thoại (alert) và bất kỳ lỗi màu đỏ nào trong Console.</li>
                        </ol>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
