import { LazyContactForm } from './lazy-contact-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Clock, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
            <h1 className="font-headline text-4xl md:text-5xl">Liên Hệ</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground font-fraunces">
                Chúng tôi rất muốn nghe từ bạn. Dù là một câu hỏi về bánh của chúng tôi hay một yêu cầu đặc biệt, chúng tôi ở đây để giúp đỡ.
            </p>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="space-y-8">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0"><Phone className="h-6 w-6 text-accent" /></div>
                    <div>
                        <h3 className="font-headline text-lg">Hotline</h3>
                        <p className="text-muted-foreground font-fraunces">Đối với các đơn hàng và yêu cầu khẩn cấp.</p>
                        <a href="tel:0912550335" className="font-medium text-foreground hover:underline">091 255 03 35</a>
                    </div>
                </div>
                 <div className="flex items-start gap-4">
                    <div className="flex-shrink-0"><Clock className="h-6 w-6 text-accent" /></div>
                    <div>
                        <h3 className="font-headline text-lg">Giờ Làm Việc</h3>
                        <p className="text-muted-foreground font-fraunces">Thứ Hai - Chủ Nhật: 9:00 - 21:00</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4">
                    <div className="flex-shrink-0"><MapPin className="h-6 w-6 text-accent" /></div>
                    <div>
                        <h3 className="font-headline text-lg">Bếp Bánh Của Chúng Tôi</h3>
                        <p className="text-muted-foreground font-fraunces">123 Phố Bánh, Hoàn Kiếm, Bắc Ninh</p>
                        <p className="text-sm text-muted-foreground font-fraunces">(Chỉ nhận đơn hàng trực tuyến và giao hàng)</p>
                    </div>
                </div>
            </div>
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Gửi Tin Nhắn Cho Chúng Tôi</CardTitle>
                        <CardDescription>Chúng tôi thường trả lời trong vòng vài giờ.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LazyContactForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
