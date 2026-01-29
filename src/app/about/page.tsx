
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function AboutPage() {
    const bannerImage = PlaceHolderImages.find(p => p.id === 'about-banner');
    const locationImage = PlaceHolderImages.find(p => p.id === 'about-location');

    return (
        <div>
            <header className="relative h-[50vh] min-h-[300px] w-full">
                {bannerImage && (
                    <Image
                        src={bannerImage.imageUrl}
                        alt={bannerImage.description}
                        fill
                        className="object-cover"
                        priority
                        data-ai-hint={bannerImage.imageHint}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20" />
                <div className="container relative mx-auto flex h-full max-w-4xl flex-col justify-center text-center text-white px-4 sm:px-6 lg:px-8">
                    <h1 className="font-headline text-4xl leading-tight md:text-6xl">
                        CÔNG TY CỔ PHẦN VIBARY
                    </h1>
                    <p className="mt-4 text-xl font-fraunces">ĐIỂM ĐẾN CỦA ẨM THỰC BÁNH TẠI BẮC NINH</p>
                </div>
            </header>

            <div className="container mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
                <div className="prose prose-lg mx-auto max-w-none prose-h2:font-headline prose-p:text-muted-foreground prose-blockquote:border-accent prose-blockquote:text-accent prose-blockquote:font-headline">
                    
                    <blockquote className="text-center text-2xl">
                        "Vibary - Mang Ẩm Thực Ngọt Ngào Đến Cuộc Sống"
                    </blockquote>

                    <h2>Giới thiệu về chúng tôi</h2>
                    <p>
                        Công ty cổ phần Vibary chuyên sản xuất và cung cấp các loại bánh tinh tế, độc đáo và ngon miệng. Với tâm huyết và tình yêu dành cho nghệ thuật ẩm thực, chúng tôi đã tạo nên một danh tiếng vững chắc trong lĩnh vực sản xuất bánh sinh nhật, bánh ngọt, bánh cưới, bánh mừng thọ và bánh cho các sự kiện tiệc tea break.
                    </p>

                    <h2>Địa điểm</h2>
                    <p>
                        Chúng tôi có trụ sở chính tại số 3 Nguyễn Văn Trỗi Phường Ninh Xá Thành Phố Bắc Ninh, nơi chúng tôi đã xây dựng một không gian sáng tạo và hiện đại để sản xuất các loại bánh tinh tế. Địa chỉ của chúng tôi là một điểm gặp gỡ của nghệ thuật ẩm thực và sự sáng tạo.
                    </p>
                    
                    {locationImage && (
                        <div className="my-8 rounded-lg overflow-hidden shadow-lg">
                            <Image
                                src={locationImage.imageUrl}
                                alt={locationImage.description}
                                width={1200}
                                height={600}
                                className="w-full object-cover"
                                data-ai-hint={locationImage.imageHint}
                            />
                        </div>
                    )}

                    <h2>Dịch vụ của chúng tôi</h2>
                    
                    <h3>Bánh Sinh Nhật</h3>
                    <p>Chúng tôi hiểu rằng mỗi ngày sinh nhật là một cơ hội để kỷ niệm và chia sẻ niềm vui. Chính vì vậy, chúng tôi tạo ra những chiếc bánh sinh nhật độc đáo, phản ánh cá tính và sở thích riêng của từng người.</p>

                    <h3>Bánh Ngọt</h3>
                    <p>Từ những chiếc cupcakes nhỏ xinh đến những tác phẩm bánh ngọt lớn hơn, chúng tôi mang đến những món quà ngọt ngào cho mọi dịp. Sự sáng tạo và nguyên liệu chất lượng cao là tâm điểm của mỗi chiếc bánh mà chúng tôi tạo ra.</p>

                    <h3>Bánh Cưới</h3>
                    <p>Ngày cưới là một trong những sự kiện quan trọng trong cuộc đời, và chúng tôi hiểu rằng bánh cưới không chỉ là món ăn mà còn là biểu tượng của tình yêu và hạnh phúc. Chúng tôi tạo ra những chiếc bánh cưới tinh xảo, thể hiện sự tinh tế và vẻ đẹp độc đáo của mỗi đôi uyên ương.</p>

                    <h3>Bánh Mừng Thọ</h3>
                    <p>Mỗi dịp xuân sang là dịp để con cháu hiếu kính đến ông bà nhân dịp chúc thọ, hiểu được điều đó chúng tôi luôn nâng niu sáng tạo không ngừng thể hiện lòng biết ơn trong từng chiếc bánh mừng thọ được làm ra bởi những nghệ nhân tài hoa của chúng tôi.</p>

                    <h3>Bánh Tiệc Tea Break</h3>
                    <p>Dịch vụ này dành riêng cho doanh nghiệp và cá nhân tổ chức sự kiện, mang đến những bữa tiệc nhẹ đầy ngon miệng và sáng tạo. Chúng tôi hiểu rằng tiệc tea break không chỉ là cơ hội để thưởng thức ẩm thực mà còn là cách thể hiện tình cảm và chia sẻ.</p>

                    <p className="text-center mt-12 font-fraunces">
                        <strong>Với đội ngũ nhiệt huyết và sự tận tâm đối với nghệ thuật ẩm thực, chúng tôi cam kết mang đến những sản phẩm bánh tinh túy và độc đáo nhất cho mọi dịp. Hãy để Vibary chia sẻ niềm vui và hạnh phúc trong cuộc sống của bạn qua những chiếc bánh ngon và đẹp mắt.</strong>
                    </p>
                </div>
            </div>
        </div>
    );
}
