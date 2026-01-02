// File: src/app/admin/news/data.ts

export const ArticleStatus = {
  Published: 'Published',
  Draft: 'Draft',
  Hidden: 'Hidden',
} as const;

export type ArticleStatus = typeof ArticleStatus[keyof typeof ArticleStatus];


export const ArticleCategory = {
  NewCakes: 'Ra mắt Bánh mới',
  Promotions: 'Khuyến mãi Đặc biệt',
  Recipes: 'Công thức tại nhà',
  Events: 'Sự kiện Lễ hội',
  Stories: 'Chuyện của Tiệm',
  CustomerFavorites: 'Khách hàng chia sẻ',
  BakingTips: 'Mẹo Bảo quản Bánh',
  Seasonal: 'Theo Mùa',
} as const;

export type ArticleCategory = typeof ArticleCategory[keyof typeof ArticleCategory];


export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  categories: ArticleCategory[];
  status: ArticleStatus;
  publicationDate: string;
  featuredImage: string; // URL
  additionalImages: string[]; // URLs
  shortDescription: string;
  content: string; // HTML content from TipTap
  isFeatured: boolean;
  tags: string[];
  views: number;
}

export const initialArticles: NewsArticle[] = [
  {
    id: 'news-001',
    title: 'Ra mắt Bộ sưu tập Bánh Trung Thu 2024: "Trăng Vàng Ký Ức"',
    slug: 'ra-mat-bo-suu-tap-banh-trung-thu-2024',
    categories: [ArticleCategory.NewCakes, ArticleCategory.Seasonal],
    status: 'Published',
    publicationDate: '2024-07-15T10:00:00Z',
    featuredImage: 'https://picsum.photos/seed/mooncake1/400/300',
    additionalImages: [],
    shortDescription: 'Khám phá bộ sưu tập bánh Trung Thu 2024 đầy sáng tạo của Vibary, kết hợp hương vị truyền thống và nét chấm phá hiện đại.',
    content: '<h2>Hương vị truyền thống, diện mạo mới</h2><p>Mùa trăng rằm năm nay, Vibary tự hào giới thiệu BST "Trăng Vàng Ký Ức" với 4 hương vị độc đáo...</p>',
    isFeatured: true,
    tags: ['trung thu', 'bánh mới', 'quà tặng'],
    views: 1250,
  },
  {
    id: 'news-002',
    title: 'Công thức Bánh quy Bơ Đan Mạch giòn tan tại nhà',
    slug: 'cong-thuc-banh-quy-bo-dan-mach',
    categories: [ArticleCategory.Recipes],
    status: 'Published',
    publicationDate: '2024-07-10T14:30:00Z',
    featuredImage: 'https://picsum.photos/seed/cookies2/400/300',
    additionalImages: [],
    shortDescription: 'Cùng vào bếp với Vibary để làm món bánh quy bơ Đan Mạch thơm lừng, giòn rụm, nhâm nhi cùng tách trà chiều.',
    content: '<h3>Nguyên liệu cần chuẩn bị</h3><table><tbody><tr><td>Bơ lạt</td><td>200g</td></tr><tr><td>Đường bột</td><td>80g</td></tr><tr><td>Lòng trắng trứng</td><td>1 quả</td></tr><tr><td>Bột mì đa dụng</td><td>250g</td></tr></tbody></table><p>Xem chi tiết các bước thực hiện...</p>',
    isFeatured: false,
    tags: ['công thức', 'bánh quy', 'tự làm'],
    views: 3400,
  },
  {
    id: 'news-003',
    title: 'Khuyến mãi đặc biệt: "Thứ Tư Ngọt Ngào" - Giảm 20% cho tất cả bánh ngọt',
    slug: 'khuyen-mai-thu-tu-ngot-ngao',
    categories: [ArticleCategory.Promotions],
    status: 'Published',
    publicationDate: '2024-07-08T09:00:00Z',
    featuredImage: 'https://picsum.photos/seed/promo3/400/300',
    additionalImages: [],
    shortDescription: 'Tận hưởng ngày giữa tuần thêm ngọt ngào với ưu đãi giảm 20% cho toàn bộ các sản phẩm bánh ngọt tại Vibary vào mỗi thứ Tư.',
    content: '<p>Đừng để ngày thứ Tư trôi qua nhàm chán! Vibary mang đến chương trình <strong style="color: #c026d3">"Thứ Tư Ngọt Ngào"</strong>. Áp dụng cho tất cả các đơn hàng online và mua tại cửa hàng.</p>',
    isFeatured: true,
    tags: ['khuyến mãi', 'thứ tư', 'bánh ngọt'],
    views: 820,
  },
  {
    id: 'news-004',
    title: 'Chuyện của Tiệm: Hành trình từ căn bếp nhỏ đến thương hiệu được yêu mến',
    slug: 'chuyen-cua-tiem-hanh-trinh',
    categories: [ArticleCategory.Stories],
    status: 'Published',
    publicationDate: '2024-07-01T11:00:00Z',
    featuredImage: 'https://picsum.photos/seed/story4/400/300',
    additionalImages: [],
    shortDescription: 'Lắng nghe câu chuyện đầy cảm hứng của người sáng lập Vibary, từ niềm đam mê làm bánh trong căn bếp gia đình đến việc xây dựng một thương hiệu bánh ngọt được tin yêu.',
    content: '<blockquote><p>"Mỗi chiếc bánh là một câu chuyện, và tôi muốn kể những câu chuyện ngọt ngào nhất." - Founder</p></blockquote><p>Hành trình của chúng tôi bắt đầu từ...</p>',
    isFeatured: false,
    tags: ['câu chuyện thương hiệu', 'founder'],
    views: 950,
  },
  {
    id: 'news-005',
    title: 'Mẹo bảo quản bánh Entremet luôn tươi ngon như mới',
    slug: 'meo-bao-quan-banh-entremet',
    categories: [ArticleCategory.BakingTips],
    status: 'Draft',
    publicationDate: '2024-07-20T10:00:00Z',
    featuredImage: 'https://picsum.photos/seed/tips5/400/300',
    additionalImages: [],
    shortDescription: 'Bánh Entremet là dòng bánh tinh tế và cần được bảo quản đúng cách. Hãy cùng Vibary tìm hiểu các mẹo để giữ bánh luôn ở trạng thái tốt nhất.',
    content: '<h2>Nhiệt độ là chìa khóa</h2><p>Bánh Entremet cần được bảo quản trong ngăn mát tủ lạnh ở nhiệt độ từ 2-5°C...</p>',
    isFeatured: false,
    tags: ['bảo quản', 'entremet', 'mẹo vặt'],
    views: 0,
  },
];
