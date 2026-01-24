

import type { Product, Collection, Article, FaqItem, NavLink } from './types';

export const navLinks: NavLink[] = [
  { href: '/products', label: 'Sản Phẩm' },
  { href: '/about', label: 'Về Vibary' },
  { href: '/faq', label: 'Hỏi đáp' },
  { href: '/news', label: 'Tin Tức' },
  { href: '/contact', label: 'Liên Hệ' },
];

export const collections: Collection[] = [
  {
    id: '1',
    slug: 'special-occasions',
    title: 'Entremet cho Dịp Đặc Biệt',
    description: 'Nâng tầm lễ kỷ niệm của bạn với những chiếc bánh đáng nhớ như chính khoảnh khắc.',
    imageId: 'collection-special-occasion',
  },
  {
    id: '2',
    slug: 'heart-shaped',
    title: 'Bánh Hình Trái Tim',
    description: 'Một cử chỉ yêu thương, được chế tác bằng niềm đam mê và những nguyên liệu tốt nhất.',
    imageId: 'collection-heart-shaped',
  },
  {
    id: '3',
    slug: 'half-entremet',
    title: 'Half Entremet cho Ngày Thường',
    description: 'Thưởng thức một khoảnh khắc hạnh phúc thuần khiết, khẩu phần hoàn hảo cho hai đến năm người.',
    imageId: 'collection-half',
  },
  {
    id: '4',
    slug: 'baby-collection',
    title: 'Bộ Sưu Tập Bé Xinh',
    description: 'Những sáng tạo tinh tế cho những niềm vui và cột mốc nhỏ trong đời.',
    imageId: 'collection-baby',
  },
];

export const products: Product[] = [
  {
    id: 'prod-001',
    slug: 'lychee-rose-delight',
    name: 'BE IN BLOSSOM',
    subtitle: 'VẢI & HOA HỒNG',
    description: 'Vũ điệu thơ mộng của hoa hồng thơm ngát và vải ngọt ngào.',
    detailedDescription: {
      flavor: 'Mousse hoa hồng tinh tế kết hợp với thạch vải nhẹ và bánh bông lan hạnh nhân mềm mại. Một chút mâm xôi thêm vị chua nhẹ.',
      ingredients: 'Mousse hoa hồng, thạch vải, mứt mâm xôi, bánh dacquoise hạnh nhân, lớp phủ sô cô la trắng.',
      serving: 'Dành cho 6-8 người ăn',
      storage: 'Luôn giữ bánh trong hộp kín & bảo quản trong ngăn mát tủ lạnh. Không nên để bánh ở nhiệt độ phòng quá 30 phút (Bánh sẽ bị chảy). Sử dụng trong vòng 03 ngày.',
      dimensions: 'Đường kính: 16cm | Chiều cao: 5cm',
      accessories: [
        '01 Chiếc nến sinh nhật',
        '01 Bộ đĩa và dĩa dành cho 10 người',
        '01 Dao cắt bánh'
      ]
    },
    price: 650000,
    sizes: [
      { name: '16cm (6-8 người)', price: 650000 },
      { name: '18cm (8-10 người)', price: 780000 },
    ],
    imageUrls: ['/images/product/BeinBlossom2.avif'],
    collection: 'special-occasions',
    categorySlug: 'banh-sinh-nhat',
    flavorProfile: ['Ngọt ngào', 'Thơm ngát', 'Tinh tế'],
    structure: [
        'Phun phủ bơ cacao',
        'Mousse hoa hồng',
        'Thạch vải & mứt mâm xôi',
        'Bạt bánh hạnh nhân',
        'Đế giòn'
    ],
    stock: 15,
  },
  {
    id: 'prod-002',
    slug: 'passion-fruit-breeze',
    name: 'BELOVED DARLING',
    subtitle: 'CHANH DÂY & DỪA',
    description: 'Một cuộc trốn chạy đến miền nhiệt đới trong mỗi miếng bánh, sống động và sảng khoái.',
    detailedDescription: {
      flavor: 'Kem chanh dây tươi sáng, xếp lớp với mousse dừa và đế dừa giòn. Một hương vị của mùa hè.',
      ingredients: 'Kem chanh dây, mousse dừa, bánh bông lan hạnh nhân, đế dừa giòn.',
      serving: 'Dành cho 6-8 người ăn',
      storage: 'Luôn giữ bánh trong hộp kín & bảo quản trong ngăn mát tủ lạnh. Không nên để bánh ở nhiệt độ phòng quá 30 phút (Bánh sẽ bị chảy). Sử dụng trong vòng 03 ngày.',
      dimensions: 'Đường kính: 16cm | Chiều cao: 5cm',
      accessories: [
        '01 Chiếc nến sinh nhật',
        '01 Bộ đĩa và dĩa dành cho 10 người',
        '01 Dao cắt bánh'
      ]
    },
    price: 620000,
     sizes: [
      { name: '16cm (6-8 người)', price: 620000 },
      { name: '18cm (8-10 người)', price: 750000 },
    ],
    imageUrls: ['/images/product/BelovedDarling2.avif'],
    collection: 'special-occasions',
    categorySlug: 'banh-sinh-nhat',
    flavorProfile: ['Chua thanh', 'Nhiệt đới', 'Sảng khoái'],
    structure: [
        'Phun phủ bơ cacao',
        'Mousse chanh dây',
        'Mousse dừa',
        'Bạt bánh hạnh nhân',
        'Đế dừa giòn'
    ],
    stock: 12,
  },
  {
    id: 'prod-003',
    slug: 'a-little-grace',
    name: 'A LITTLE GRACE',
    subtitle: 'MATCHA & YUZU',
    description: 'Sự kết hợp thanh lịch giữa vị trà matcha đất và vị cam yuzu.',
    detailedDescription: {
      flavor: 'Mousse matcha Uji đậm đà cân bằng với sữa đông yuzu chua thanh, trên nền bánh bông lan mè đen. Một trải nghiệm tựa thiền.',
      ingredients: 'Mousse matcha Uji, sữa đông yuzu, bánh joconde mè đen, sô cô la trắng.',
      serving: 'Dành cho 2-4 người ăn',
      storage: 'Luôn giữ bánh trong hộp kín & bảo quản trong ngăn mát tủ lạnh. Không nên để bánh ở nhiệt độ phòng quá 30 phút (Bánh sẽ bị chảy). Sử dụng trong vòng 03 ngày.',
      dimensions: 'Đường kính: 12cm | Chiều cao: 5cm',
      accessories: [
        '01 Chiếc nến sinh nhật',
        '01 Bộ đĩa và dĩa dành cho 4 người',
        '01 Dao cắt bánh'
      ]
    },
    price: 380000,
    imageUrls: ['/images/product/ALittleGrace2.avif'],
    collection: 'half-entremet',
    categorySlug: 'banh-le',
    flavorProfile: ['Đậm vị trà', 'Chua nhẹ', 'Thanh lịch'],
     structure: [
        'Phủ bột matcha',
        'Mousse matcha Uji',
        'Kem yuzu',
        'Bạt bánh mè đen',
        'Đế giòn'
    ],
    stock: 20,
  },
  {
    id: 'prod-004',
    slug: 'chocolate-hazelnut-dream',
    name: 'SUMMER CALLING',
    subtitle: 'SÔ CÔ LA & HẠT DẺ',
    description: 'Một món ăn xa hoa và sang trọng cho người thực sự yêu sô cô la.',
    detailedDescription: {
      flavor: 'Mousse sô cô la đen 66% mịn mượt, nhân praline hạt phỉ kem, và bánh bông lan sô cô la ẩm, tất cả trên một lớp đế feuilletine giòn.',
      ingredients: 'Mousse sô cô la đen, praline hạt phỉ, bánh bông lan sô cô la, đế feuilletine giòn.',
      serving: 'Dành cho 8-10 người ăn',
      storage: 'Luôn giữ bánh trong hộp kín & bảo quản trong ngăn mát tủ lạnh. Ngon nhất khi để ở nhiệt độ phòng 15 phút trước khi dùng. Sử dụng trong vòng 03 ngày.',
      dimensions: 'Đường kính: 18cm | Chiều cao: 5cm',
      accessories: [
        '01 Chiếc nến sinh nhật',
        '01 Bộ đĩa và dĩa dành cho 10 người',
        '01 Dao cắt bánh'
      ]
    },
    price: 700000,
    sizes: [
      { name: '18cm (8-10 người)', price: 700000 },
      { name: '20cm (10-12 người)', price: 850000 },
    ],
    imageUrls: ['/images/product/OneSunnyDay2.avif'],
    collection: 'special-occasions',
    categorySlug: 'banh-sinh-nhat',
    flavorProfile: ['Đậm đà', 'Sang trọng', 'Giòn tan'],
     structure: [
        'Phủ sô cô la',
        'Mousse sô cô la đen',
        'Kem praline hạt dẻ',
        'Bạt bánh sô cô la',
        'Đế giòn feuilletine'
    ],
    stock: 8,
  },
  {
    id: 'prod-005',
    slug: 'strawberry-love',
    name: 'A GENTLE BLEND',
    subtitle: 'DÂU TÂY & VANI',
    description: 'Trái tim của dâu tây ngọt ngào và kem vani.',
    detailedDescription: {
      flavor: 'Mứt dâu tây tươi và kem mascarpone vani nhẹ trên bánh bông lan vani mềm. Đơn giản là đáng yêu.',
      ingredients: 'Mứt dâu tây, kem mascarpone vani, bánh bông lan vani, dâu tây tươi.',
      serving: 'Dành cho 6-8 người ăn',
      storage: 'Luôn giữ bánh trong hộp kín & bảo quản trong ngăn mát tủ lạnh. Ngon nhất khi dùng trong ngày mua do có trái cây tươi. Sử dụng trong vòng 03 ngày.',
      dimensions: 'Đường kính: 16cm | Chiều cao: 5cm',
      accessories: [
        '01 Chiếc nến sinh nhật',
        '01 Bộ đĩa và dĩa dành cho 10 người',
        '01 Dao cắt bánh'
      ]
    },
    price: 680000,
    imageUrls: ['/images/product/SecretGarden2.avif'],
    collection: 'heart-shaped',
    categorySlug: 'banh-le',
     flavorProfile: ['Ngọt ngào', 'Kinh điển', 'Trái cây tươi'],
     structure: [
        'Trang trí dâu tươi',
        'Kem mascarpone vani',
        'Mứt dâu tây',
        'Bạt bánh vani',
        'Đế bánh quy'
    ],
    stock: 18,
  },
  {
    id: 'prod-006',
    slug: 'baby-mango-bliss',
    name: 'Baby Mango Bliss',
    subtitle: 'XOÀI & CHANH DÂY',
    description: 'Chiếc bánh nhỏ tràn ngập ánh nắng và hương vị xoài ngọt ngào.',
    detailedDescription: {
      flavor: 'Mousse xoài nhẹ với nhân thạch chanh dây. Kích thước hoàn hảo cho một khoảnh khắc hạnh phúc nhỏ.',
      ingredients: 'Mousse xoài, thạch chanh dây, bánh bông lan hạnh nhân.',
      serving: 'Dành cho 1-2 người ăn',
      storage: 'Luôn giữ bánh trong hộp kín & bảo quản trong ngăn mát tủ lạnh. Không nên để bánh ở nhiệt độ phòng quá 30 phút (Bánh sẽ bị chảy). Sử dụng trong vòng 03 ngày.',
      dimensions: 'Đường kính: 8cm | Chiều cao: 5cm',
      accessories: [
        '01 Chiếc nến sinh nhật',
        '01 Bộ đĩa và dĩa dành cho 2 người',
        '01 Dao cắt bánh'
      ]
    },
    price: 250000,
    imageUrls: ['/images/product/baby-mango-bliss.png'],
    collection: 'baby-collection',
    categorySlug: 'banh-le',
     flavorProfile: ['Nhiệt đới', 'Ngọt dịu', 'Dễ thương'],
     structure: [
        'Phun phủ màu vàng',
        'Mousse xoài',
        'Thạch chanh dây',
        'Bạt bánh hạnh nhân',
        'Đế giòn'
    ],
    stock: 30,
  },
  {
    id: 'prod-007',
    slug: 'raspberry-pistachio-half',
    name: 'Raspberry & Pistachio Half',
    subtitle: 'MÂM XÔI & HẠT DẺ CƯỜI',
    description: 'Sự kết hợp sống động của mâm xôi chua và hạt dẻ cười bùi.',
    detailedDescription: {
      flavor: 'Mousse hạt dẻ cười mịn màng với trái tim thạch mâm xôi chua, trên nền bánh dacquoise hạt dẻ cười tinh tế.',
      ingredients: 'Mousse hạt dẻ cười, thạch mâm xôi, bánh dacquoise hạt dẻ cười.',
      serving: 'Dành cho 2-4 người ăn',
      storage: 'Luôn giữ bánh trong hộp kín & bảo quản trong ngăn mát tủ lạnh. Màu sắc và hương vị ngon nhất trong ngày đầu tiên. Sử dụng trong vòng 03 ngày.',
      dimensions: 'Đường kính: 12cm | Chiều cao: 5cm',
      accessories: [
        '01 Chiếc nến sinh nhật',
        '01 Bộ đĩa và dĩa dành cho 4 người',
        '01 Dao cắt bánh'
      ]
    },
    price: 420000,
    imageUrls: ['/images/product/raspberry-pistachio-half.png'],
    collection: 'half-entremet',
    categorySlug: 'banh-le',
    flavorProfile: ['Bùi', 'Chua thanh', 'Độc đáo'],
    structure: [
        'Phủ men trắng',
        'Mousse hạt dẻ cười',
        'Thạch mâm xôi',
        'Bạt bánh hạt dẻ cười',
        'Đế giòn'
    ],
    stock: 5,
  },
  {
    id: 'prod-008',
    slug: 'summer-berry-cheesecake',
    name: 'Summer Berry Cheesecake',
    subtitle: 'CHEESECAKE & DÂU RỪNG',
    description: 'Phiên bản hiện đại của một món kinh điển, tràn ngập các loại quả mọng.',
    detailedDescription: {
      flavor: 'Kem cheesecake không nướng nhẹ nhàng được trang trí bằng một hỗn hợp các loại quả mọng mùa hè tươi trên đế bánh quy bơ.',
      ingredients: 'Phô mai kem, kem tươi, hỗn hợp các loại quả mọng (dâu tây, việt quất, mâm xôi), đế bánh quy digestive.',
      serving: 'Dành cho 6-8 người ăn',
      storage: 'Luôn giữ bánh trong hộp kín & bảo quản trong ngăn mát tủ lạnh. Ngon nhất khi dùng trong vòng 24 giờ. Sử dụng trong vòng 03 ngày.',
      dimensions: 'Đường kính: 16cm | Chiều cao: 5cm',
      accessories: [
        '01 Chiếc nến sinh nhật',
        '01 Bộ đĩa và dĩa dành cho 10 người',
        '01 Dao cắt bánh'
      ]
    },
    price: 640000,
    imageUrls: ['/images/product/summer-berry-cheesecake.png'],
    collection: 'special-occasions',
    categorySlug: 'banh-sinh-nhat',
    flavorProfile: ['Béo ngậy', 'Tươi mát', 'Kinh điển'],
    structure: [
        'Trang trí dâu rừng tươi',
        'Lớp cheesecake',
        'Đế bánh quy bơ',
        'N/A',
        'N/A'
    ],
    stock: 9,
  }
];

export const articles: Article[] = [
  {
    id: 'news-1',
    slug: 'our-founder-story',
    title: 'Hành Trình Ngọt Ngào Của Người Sáng Lập',
    excerpt: 'Từ một căn bếp nhỏ ở Bắc Ninh đến một thương hiệu bánh ngọt nổi tiếng, hãy đọc câu chuyện của người sáng lập của chúng tôi, Lan.',
    date: 'Ngày 20 tháng 5, 2024',
    category: 'Câu chuyện người sáng lập',
    imageId: 'blog-1',
    content: `
      <h2>Giấc Mơ Paris Giữa Lòng Kinh Bắc</h2>
      <p>Câu chuyện của Vibary không bắt đầu từ một tiệm bánh lớn, mà trong một căn bếp nhỏ đầy nắng ở trung tâm Bắc Ninh. Người sáng lập của chúng tôi, Lan, một cô gái trẻ với niềm đam mê ẩm thực, đã khám phá ra tình yêu với bánh ngọt Pháp trong một năm học tập tại Paris. Cô bị mê hoặc bởi tính nghệ thuật, sự chính xác và sự cân bằng tinh tế của hương vị trong mỗi chiếc bánh entremet cô nếm. Đó không chỉ là đồ ăn, đó là những tác phẩm nghệ thuật có thể ăn được.</p>
      <img src="https://images.unsplash.com/photo-1506281517039-56c64b6e5b22?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxwYXJpc2lhbiUyMHBhdGlzc2VyaWV8ZW58MHx8fHwxNzY3MDY2NjM2fDA&ixlib=rb-4.1.0&q=80&w=1080" alt="Một tiệm bánh ngọt kiểu Pháp ở Paris" class="my-8 rounded-lg shadow-lg" data-ai-hint="french patisserie">
      <p>Khi trở về Việt Nam, mang theo hoài bão, Lan mơ ước mang phép màu đó về quê hương, nhưng với một nét chấm phá độc đáo của Việt Nam. Cô muốn những chiếc bánh của mình không chỉ đẹp mà còn phải hợp với khẩu vị của người Việt - thanh hơn, ít ngọt hơn và mang đậm hương vị của các loại trái cây nhiệt đới.</p>
      <h2>Từ Ý Tưởng Đến Hiện Thực</h2>
      <p>Cô đã dành nhiều năm để hoàn thiện tay nghề, thử nghiệm với các loại trái cây địa phương theo mùa như vải, chanh dây, và xoài. Đó là một quá trình của vô số lần thử và sai - làm sao để vị chua của chanh dây không át đi vị béo của kem? Làm sao để giữ được hương thơm tinh tế của hoa hồng khi kết hợp với vải? Tầm nhìn của cô là tạo ra những chiếc bánh ngọt Pháp hiện đại vừa sang trọng vừa quen thuộc. Vibary là đỉnh cao của giấc mơ đó—một sự tôn vinh kỹ thuật, sự sáng tạo và những nguyên liệu tươi ngon nhất mà đất nước xinh đẹp của chúng ta mang lại.</p>
    `
  },
  {
    id: 'news-2',
    slug: 'behind-the-scenes-cake-creation',
    title: 'Hậu Trường: Tạo Ra Chiếc Bánh Hoàn Hảo',
    excerpt: 'Một cái nhìn thoáng qua về quy trình tỉ mỉ và niềm đam mê trong mỗi chiếc bánh của chúng tôi.',
    date: 'Ngày 15 tháng 5, 2024',
    category: 'Hậu trường',
    imageId: 'blog-2',
    content: `
      <h2>Một Bản Giao Hưởng Của Sự Tỉ Mỉ</h2>
      <p>Cần những gì để tạo ra một chiếc bánh Vibary? Nó bắt đầu từ cảm hứng—thường là từ một loại trái cây theo mùa hoặc một ký ức về một mùi hương đặc biệt. Các đầu bếp bánh của chúng tôi sau đó bắt đầu một quy trình tỉ mỉ gồm phác thảo, kết hợp hương vị và thử nghiệm. Mỗi chiếc bánh là một dự án nhỏ, và mọi chi tiết đều quan trọng.</p>
      <img src="https://images.unsplash.com/photo-1607490695893-19615a6b058a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxiYWtlciUyMGRlY29yYXRpbmclMjBjYWtlfGVufDB8fHx8MTc2NzE3MzQxN3ww&ixlib=rb-4.1.0&q=80&w=1080" alt="Đầu bếp bánh đang cẩn thận trang trí một chiếc bánh" class="my-8 rounded-lg shadow-lg" data-ai-hint="baker decorating">
      <h2>Quy Trình Của Sự Hoàn Hảo</h2>
      <p>Quy trình bao gồm nhiều công đoạn chính xác:</p>
      <ul>
        <li><strong>Mise en place:</strong> Mọi nguyên liệu, từ kem tươi đến sô cô la hảo hạng, đều được cân đo chính xác đến từng gram.</li>
        <li><strong>Tạo các lớp:</strong> Mỗi lớp - từ mousse, creméux đến dacquoise - được chế tác và đông lạnh riêng biệt. Điều này đảm bảo mỗi lớp có kết cấu hoàn hảo trước khi được kết hợp.</li>
        <li><strong>Lắp ráp:</strong> Các lớp được xếp chồng lên nhau một cách cẩn thận trong khuôn, tạo thành một cấu trúc hương vị phức tạp.</li>
        <li><strong>Glaçage (Phủ men):</strong> Nét chấm phá cuối cùng, lớp men hay "glaçage", là một khoảnh khắc tập trung tuyệt đối, đòi hỏi một bàn tay vững vàng và nhiệt độ chính xác để đạt được độ bóng như gương đặc trưng.</li>
      </ul>
      <p>Đó là một công việc của tình yêu, một vũ điệu của khoa học và nghệ thuật mà chúng tôi tự hào chia sẻ với bạn.</p>
    `
  },
  {
    id: 'news-3',
    slug: 'shopping-guide-for-introverts',
    title: 'Hướng Dẫn Mua Sắm Cho Người Hướng Nội',
    excerpt: 'Ghét gọi điện thoại? Chúng tôi hiểu. Đây là cách đặt chiếc bánh hoàn hảo của bạn, một cách yên bình và trực tuyến.',
    date: 'Ngày 10 tháng 5, 2024',
    category: 'Hướng dẫn mua sắm',
    imageId: 'blog-3',
    content: `
      <h2>Niềm Vui Mua Sắm Tĩnh Lặng</h2>
      <p>Chúng tôi tin rằng niềm vui thưởng thức một chiếc bánh đẹp nên dành cho tất cả mọi người, ngay cả những người thích sự yên tĩnh hơn là trò chuyện. Đặt hàng một chiếc bánh cho dịp đặc biệt không nên là một trải nghiệm căng thẳng. Đó là lý do tại sao chúng tôi đã thiết kế trang web của mình để trở thành một trải nghiệm yên bình và liền mạch.</p>
      <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBzaG9wcGluZyUyMHdlYnNpdGV8ZW58MHx8fHwxNzY3MTc1MTA0fDA&ixlib=rb-4.1.0&q=80&w=1080" alt="Giao diện một trang web mua sắm trực tuyến gọn gàng trên laptop" class="my-8 rounded-lg shadow-lg" data-ai-hint="online shopping">
      <h2>Các Bước Đơn Giản</h2>
      <p>Bạn có thể duyệt qua toàn bộ bộ sưu tập của chúng tôi, đọc mô tả chi tiết về từng lớp hương vị, và thậm chí tìm thấy sự kết hợp hoàn hảo cho mình với bài trắc nghiệm hương vị của chúng tôi. Toàn bộ quá trình có thể được thực hiện mà không cần phải nhấc điện thoại.</p>
      <ol>
        <li><strong>Khám phá:</strong> Dành thời gian của bạn để xem qua các sản phẩm.</li>
        <li><strong>Lựa chọn:</strong> Thêm chiếc bánh yêu thích vào giỏ hàng.</li>
        <li><strong>Tùy chỉnh:</strong> Chọn kích thước và điền lời chúc bạn muốn gửi gắm.</li>
        <li><strong>Thanh toán:</strong> Hoàn tất đơn hàng với quy trình thanh toán an toàn và đơn giản.</li>
      </ol>
      <p>Chỉ cần chọn bánh của bạn, chọn thời gian giao hàng và để chúng tôi lo phần còn lại. Đó là khoảnh khắc nuông chiều của bạn, theo cách của bạn.</p>
    `
  },
  {
    id: 'news-4',
    slug: 'art-of-entremet',
    title: 'Sự Tinh Tế Của Bánh Entremet: Khi Nghệ Thuật Gặp Vị Ngon',
    excerpt: 'Khám phá thế giới của những chiếc bánh entremet, nơi mỗi lớp bánh là một câu chuyện về sự tỉ mỉ và sáng tạo.',
    date: 'Ngày 25 tháng 5, 2024',
    category: 'Văn hóa bánh ngọt',
    imageId: 'blog-4',
    content: `
      <h2>Entremet là gì?</h2>
      <p>Entremet, một thuật ngữ bắt nguồn từ tiếng Pháp cổ, ban đầu dùng để chỉ các món ăn hoặc tiết mục giải trí được trình bày giữa các phần của một bữa tiệc lớn. Ngày nay, nó đã phát triển thành một loại bánh mousse nhiều lớp phức tạp, thể hiện đỉnh cao của nghệ thuật làm bánh Pháp. Mỗi chiếc bánh là một tác phẩm kiến trúc thu nhỏ, đòi hỏi kỹ thuật, sự chính xác và một con mắt nghệ thuật.</p>
      <img src="https://images.unsplash.com/photo-1631435349331-75e59252c388?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxlbnRyZW1ldCUyMGNha2V8ZW58MHx8fHwxNzY2OTc2NjY1fDA&ixlib=rb-4.1.0&q=80&w=1080" alt="Một chiếc bánh entremet được cắt ra để lộ các lớp bên trong" class="my-8 rounded-lg shadow-lg" data-ai-hint="cake layers">
      <h2>Cấu trúc của một chiếc Entremet</h2>
      <p>Một chiếc entremet điển hình bao gồm nhiều lớp với kết cấu và hương vị khác nhau, được thiết kế để tạo ra một trải nghiệm vị giác hài hòa. Các lớp phổ biến bao gồm:</p>
      <ul>
        <li><strong>Mousse:</strong> Lớp nền nhẹ và thoáng, thường làm từ sô cô la, trái cây hoặc kem. Đây là trái tim của chiếc bánh, mang lại sự mềm mại.</li>
        <li><strong>Cremieux hoặc Curd:</strong> Một lớp kem đậm đặc, mang lại hương vị chính. Nó có kết cấu mịn hơn mousse nhưng vẫn tan chảy trong miệng.</li>
        <li><strong>Bạt bánh (Biscuit):</strong> Như Joconde hoặc Dacquoise, tạo nên cấu trúc và độ mềm mại, thường được làm từ các loại hạt để tăng thêm hương vị.</li>
        <li><strong>Lớp giòn (Croustillant):</strong> Thường làm từ feuilletine (bánh quế vụn) hoặc các loại hạt, thêm vào kết cấu giòn tan thú vị, tạo sự tương phản.</li>
        <li><strong>Lớp phủ (Glaçage):</strong> Lớp men bóng như gương hoặc lớp phun nhung mịn màng, tạo nên vẻ ngoài hoàn hảo và bảo vệ các lớp bên trong.</li>
      </ul>
      <p>Tại Vibary, chúng tôi coi mỗi chiếc entremet là một bức tranh, và chúng tôi là những người nghệ sĩ. Hãy khám phá các tác phẩm của chúng tôi và cảm nhận sự khác biệt.</p>
    `
  },
  {
    id: 'news-5',
    slug: 'secret-of-mirror-glaze',
    title: 'Bí Mật Đằng Sau Lớp Men Bóng Gương (Glaçage)',
    excerpt: 'Làm thế nào để chúng tôi tạo ra lớp phủ bóng loáng đầy mê hoặc cho những chiếc bánh của mình? Hãy cùng tìm hiểu kỹ thuật này.',
    date: 'Ngày 28 tháng 5, 2024',
    category: 'Mẹo làm bánh',
    imageId: 'blog-5',
    content: `
      <h2>Nghệ thuật của sự hoàn hảo</h2>
      <p>Lớp men bóng gương, hay "glaçage miroir" trong tiếng Pháp, là một trong những kỹ thuật ấn tượng nhất trong nghệ thuật làm bánh hiện đại. Nó không chỉ mang lại một vẻ ngoài lộng lẫy, sang trọng mà còn bảo vệ lớp mousse bên trong, giữ cho bánh luôn tươi và ẩm. Chìa khóa để có một lớp men hoàn hảo nằm ở ba yếu tố: nhiệt độ, công thức và kỹ thuật.</p>
      <img src="https://images.unsplash.com/photo-1627834393229-3738b4f4c8c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxtaXJyb3IlMjBnbGF6ZXxlbnwwfHx8fDE3NjcwNjIwMDR8MA&ixlib=rb-4.1.0&q=80&w=1080" alt="Đầu bếp đang đổ lớp men bóng gương lên chiếc bánh đông lạnh" class="my-8 rounded-lg shadow-lg" data-ai-hint="pouring glaze">
      <h3>Nhiệt độ là tất cả</h3>
      <p>Cả bánh và men đều phải ở nhiệt độ chính xác. Bánh phải được đông lạnh hoàn toàn (khoảng -18°C) để lớp men có thể bám vào và đông lại ngay lập tức. Trong khi đó, men phải được đun nóng và làm nguội đến một nhiệt độ cụ thể (thường khoảng 32-35°C) trước khi đổ. Quá nóng, men sẽ quá lỏng và chảy đi. Quá nguội, nó sẽ quá dày và không tạo được bề mặt mịn.</p>
      <h3>Công thức cân bằng</h3>
      <p>Một công thức men bóng gương cơ bản thường bao gồm nước, đường, sữa đặc, gelatin và sô cô la (trắng, sữa hoặc đen). Mỗi thành phần đều có một vai trò quan trọng. Gelatin tạo độ đông, sữa đặc mang lại độ che phủ và độ bóng. Sự cân bằng chính xác là điều cần thiết để có được kết quả mong muốn. Tại Vibary, chúng tôi đã dành hàng giờ để hoàn thiện công thức của riêng mình, đảm bảo độ bóng hoàn hảo và hương vị tuyệt vời.</p>
    `
  },
  {
    id: 'news-6',
    slug: 'vietnamese-fruits-in-french-pastry',
    title: 'Hương Vị Việt Trong Bánh Ngọt Pháp',
    excerpt: 'Hành trình kết hợp những loại trái cây nhiệt đới của Việt Nam vào kỹ thuật làm bánh cổ điển của Pháp.',
    date: 'Ngày 01 tháng 6, 2024',
    category: 'Khám phá hương vị',
    imageId: 'blog-6',
    content: `
      <h2>Sự giao thoa văn hóa ẩm thực</h2>
      <p>Tôn vinh nguồn nguyên liệu địa phương là một phần cốt lõi trong triết lý của Vibary. Chúng tôi tự hào tìm kiếm những loại trái cây tươi ngon nhất từ khắp các vùng miền Việt Nam để đưa vào những chiếc bánh ngọt kiểu Pháp của mình. Từ vị ngọt ngào của vải thiều Lục Ngạn, hương thơm nồng nàn của xoài cát Hòa Lộc, đến vị chua thanh của chanh dây Đà Lạt - mỗi loại quả đều mang một câu chuyện riêng.</p>
      <img src="https://images.unsplash.com/photo-1550258987-190a2d41a8ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGZydWl0c3xlbnwwfHx8fDE3NjY5NTA5OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080" alt="Một rổ đầy ắp các loại trái cây nhiệt đới" class="my-8 rounded-lg shadow-lg" data-ai-hint="tropical fruit">
      <h2>Thách thức và Sáng tạo</h2>
      <p>Thách thức nằm ở việc cân bằng hương vị. Trái cây nhiệt đới thường có vị ngọt và hương thơm mạnh mẽ. Các đầu bếp của chúng tôi phải khéo léo điều chỉnh công thức, giảm lượng đường và kết hợp các yếu tố khác để làm nổi bật hương vị tự nhiên của trái cây mà không làm lấn át sự tinh tế của các lớp bánh khác. Ví dụ, với bánh chanh dây, chúng tôi kết hợp với vị béo của dừa để làm dịu đi vị chua gắt, tạo ra một sự cân bằng hoàn hảo. Kết quả là những sáng tạo độc đáo, vừa mang đậm dấu ấn Pháp, vừa tôn vinh trọn vẹn hương vị quê nhà.</p>
    `
  },
  {
    id: 'news-7',
    slug: 'perfect-cake-for-every-occasion',
    title: 'Chọn Bánh Hoàn Hảo Cho Mọi Dịp',
    excerpt: 'Từ sinh nhật đến những bữa tiệc trà, hãy để chúng tôi giúp bạn tìm thấy chiếc bánh lý tưởng.',
    date: 'Ngày 05 tháng 6, 2024',
    category: 'Hướng dẫn mua sắm',
    imageId: 'blog-7',
    content: `
      <h2>Chiếc Bánh Cho Từng Khoảnh Khắc</h2>
      <p>Một chiếc bánh không chỉ là một món tráng miệng, nó là trung tâm của lễ kỷ niệm. Việc chọn đúng chiếc bánh có thể nâng tầm bất kỳ sự kiện nào. Dưới đây là một vài gợi ý từ Vibary để giúp bạn:</p>
      <img src="https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxjZWxlYnJhdGlvbiUyMGNha2V8ZW58MHx8fHwxNzY3MTc1MTA0fDA&ixlib=rb-4.1.0&q=80&w=1080" alt="Nhiều loại bánh ngọt khác nhau được bày biện cho một bữa tiệc" class="my-8 rounded-lg shadow-lg" data-ai-hint="celebration cake">
      <ul>
        <li><strong>Sinh nhật:</strong> Hãy chọn một chiếc bánh vui tươi và đầy màu sắc. Các hương vị trái cây như chanh dây hoặc dâu tây luôn là lựa chọn phổ biến. Chiếc "BELOVED DARLING" của chúng tôi là một gợi ý tuyệt vời để mang lại không khí nhiệt đới cho bữa tiệc.</li>
        <li><strong>Kỷ niệm:</strong> Một chiếc bánh tinh tế và lãng mạn là lựa chọn hoàn hảo. Bánh hình trái tim như "A GENTLE BLEND" với hương dâu và vani sẽ là một thông điệp ngọt ngào, thay cho ngàn lời muốn nói.</li>
        <li><strong>Quà tặng:</strong> Để thể hiện sự trân trọng, hãy chọn một chiếc bánh có hương vị độc đáo và sang trọng. "A LITTLE GRACE" với matcha và yuzu là một lựa chọn thanh lịch và đầy bất ngờ, thể hiện sự tinh tế của người tặng.</li>
        <li><strong>Tụ họp bạn bè:</strong> Một chiếc bánh dễ chia sẻ với hương vị được nhiều người yêu thích như sô cô la là phù hợp nhất. "SUMMER CALLING" của chúng tôi chắc chắn sẽ làm hài lòng mọi người với sự kết hợp kinh điển giữa sô cô la và hạt dẻ.</li>
      </ul>
    `
  },
  {
    id: 'news-8',
    slug: 'chocolate-story',
    title: 'Câu Chuyện Về Sô-cô-la: Từ Hạt Cacao Đến Thanh Sô-cô-la',
    excerpt: 'Hành trình kỳ diệu của hạt cacao và lý do tại sao chúng tôi chỉ chọn loại sô-cô-la ngon nhất.',
    date: 'Ngày 10 tháng 6, 2024',
    category: 'Khám phá hương vị',
    imageId: 'blog-8',
    content: `
      <h2>Niềm Đam Mê Bất Tận</h2>
      <p>Sô-cô-la không chỉ là một nguyên liệu, đó là một niềm đam mê. Tại Vibary, chúng tôi rất coi trọng sô-cô-la. Chúng tôi tin rằng chất lượng của một chiếc bánh sô-cô-la phụ thuộc hoàn toàn vào chất lượng của sô-cô-la được sử dụng.</p>
      <img src="https://images.unsplash.com/photo-1606813353462-a1b4b73b5f54?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxjb2NvYSUyMHBvZHxlbnwwfHx8fDE3NjcwNjIwMDR8MA&ixlib=rb-4.1.0&q=80&w=1080" alt="Những quả cacao tươi vừa được thu hoạch" class="my-8 rounded-lg shadow-lg" data-ai-hint="cocoa pod">
      <h2>Hành Trình Của Hạt Cacao</h2>
      <p>Quá trình từ hạt cacao đến thanh sô-cô-la rất phức tạp, bao gồm:</p>
      <ul>
        <li><strong>Lên men:</strong> Các hạt được lên men để phát triển các tiền chất hương vị.</li>
        <li><strong>Sấy khô:</strong> Giảm độ ẩm để bảo quản.</li>
        <li><strong>Rang:</strong> Bước quan trọng để phát triển hương vị sô cô la đặc trưng.</li>
        <li><strong>Nghiền và Conching:</strong> Hạt được nghiền thành khối lỏng và sau đó được khuấy trộn trong nhiều giờ (conching) để làm mịn kết cấu và phát triển hương vị phức tạp.</li>
      </ul>
      <p>Chúng tôi hợp tác với các nhà cung cấp sô-cô-la danh tiếng, những người có cùng cam kết về chất lượng và đạo đức. Chúng tôi ưu tiên sử dụng sô-cô-la "single-origin" (có nguồn gốc từ một vùng duy nhất) để làm nổi bật hương vị đặc trưng của từng vùng đất trồng cacao. Từ hương trái cây của cacao Peru đến hương vị đậm đà của cacao Việt Nam, mỗi loại đều mang đến một trải nghiệm khác biệt.</p>
    `
  },
  {
    id: 'news-9',
    slug: 'why-we-love-dacquoise',
    title: 'Tại Sao Chúng Tôi Yêu Thích Bạt Bánh Dacquoise',
    excerpt: 'Tìm hiểu về loại bạt bánh hạnh nhân mềm, dai nhẹ đã trở thành nền tảng cho nhiều sáng tạo của chúng tôi.',
    date: 'Ngày 14 tháng 6, 2024',
    category: 'Câu chuyện làm bánh',
    imageId: 'blog-9',
    content: `
      <h2>Nền Tảng Tinh Tế</h2>
      <p>Trong thế giới bánh ngọt Pháp, có rất nhiều loại bạt bánh khác nhau, nhưng Dacquoise chiếm một vị trí đặc biệt trong trái tim chúng tôi. Được làm từ lòng trắng trứng, đường và bột hạnh nhân hoặc hạt phỉ, Dacquoise có một kết cấu độc đáo: mềm mại, hơi dai, và tan chảy trong miệng. Nó mang đến một sự phong phú về hương vị hạt mà không quá nặng nề.</p>
      <img src="https://images.unsplash.com/photo-1627308594285-6516f457a412?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxhbG1vbmQlMjBmbG91cnxlbnwwfHx8fDE3NjcxNzUzNzZ8MA&ixlib=rb-4.1.0&q=80&w=1080" alt="Bột hạnh nhân và hạt hạnh nhân" class="my-8 rounded-lg shadow-lg" data-ai-hint="almond flour">
      <h2>Sự Linh Hoạt Đáng Kinh Ngạc</h2>
      <p>Không giống như các loại bạt bánh bông lan khác, Dacquoise không chứa bột mì, làm cho nó nhẹ hơn và tự nhiên không chứa gluten. Điều này làm cho nó trở thành một lựa chọn tuyệt vời cho những người nhạy cảm với gluten. Hương vị hạt dẻ tinh tế của nó cũng kết hợp hoàn hảo với nhiều loại mousse và kem, từ hương trái cây tươi mát đến sô cô la đậm đà, tạo nên một lớp nền vững chắc mà không lấn át các hương vị khác. Đó là lý do tại sao bạn sẽ tìm thấy nó trong nhiều chiếc bánh của Vibary, như chiếc "BE IN BLOSSOM" đặc trưng của chúng tôi.</p>
    `
  },
  {
    id: 'news-10',
    slug: 'the-perfect-pairing-cakes-and-tea',
    title: 'Sự Kết Hợp Hoàn Hảo: Bánh Ngọt và Trà',
    excerpt: 'Nâng tầm trải nghiệm thưởng thức bánh của bạn bằng cách kết hợp chúng với loại trà phù hợp.',
    date: 'Ngày 18 tháng 6, 2024',
    category: 'Văn hóa bánh ngọt',
    imageId: 'blog-10',
    content: `
      <h2>Một Nghi Thức Thưởng Thức</h2>
      <p>Thưởng thức một miếng bánh ngon đã là một niềm vui, nhưng khi kết hợp với một tách trà phù hợp, trải nghiệm đó có thể trở nên thăng hoa. Việc kết hợp đúng loại trà có thể làm nổi bật hương vị của bánh, làm sạch vòm miệng và tạo ra một sự cân bằng hài hòa. Dưới đây là một vài gợi ý từ Vibary:</p>
      <img src="https://images.unsplash.com/photo-1579901763985-61113b5a74e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxjYWtlJTIwdGVhfGVufDB8fHx8MTc2NzA2MjAwNHww&ixlib=rb-4.1.0&q=80&w=1080" alt="Một bữa tiệc trà chiều với bánh và trà" class="my-8 rounded-lg shadow-lg" data-ai-hint="afternoon tea">
      <ul>
        <li><strong>Bánh trái cây (như BELOVED DARLING):</strong> Kết hợp với một loại trà xanh nhẹ nhàng như Sencha hoặc trà lài. Vị thanh mát của trà sẽ làm nổi bật hương vị tươi mới của trái cây.</li>
        <li><strong>Bánh sô cô la (như SUMMER CALLING):</strong> Một tách trà đen đậm đà như Earl Grey hoặc English Breakfast sẽ là bạn đồng hành lý tưởng. Vị chát nhẹ của trà sẽ cân bằng sự đậm đà của sô cô la.</li>
        <li><strong>Bánh trà xanh (như A LITTLE GRACE):</strong> Để tăng cường hương vị matcha, hãy thử kết hợp với Genmaicha (trà xanh gạo lứt rang). Hương thơm của gạo rang sẽ bổ sung tuyệt vời cho vị trà xanh.</li>
        <li><strong>Bánh hương hoa (như BE IN BLOSSOM):</strong> Một loại trà trắng tinh tế hoặc trà hoa cúc sẽ là sự lựa chọn hoàn hảo, tôn lên hương thơm nhẹ nhàng của bánh.</li>
      </ul>
      <p>Hãy thử những sự kết hợp này và tìm ra đâu là "cặp đôi hoàn hảo" của riêng bạn!</p>
    `
  },
  {
    id: 'news-11',
    slug: 'a-day-in-the-vibary-kitchen',
    title: 'Một Ngày Trong Bếp Bánh Vibary',
    excerpt: 'Từ bình minh đến hoàng hôn, hãy xem cách đội ngũ của chúng tôi mang những chiếc bánh ngọt vào cuộc sống.',
    date: 'Ngày 22 tháng 6, 2024',
    category: 'Hậu trường',
    imageId: 'blog-11',
    content: `
      <h2>Bản Giao Hưởng Buổi Sáng</h2>
      <p>Một ngày trong bếp của Vibary bắt đầu từ rất sớm, khi thành phố vẫn còn đang say ngủ. Không khí tràn ngập mùi thơm của bơ đang tan chảy và hạnh nhân đang được nướng. Các đầu bếp của chúng tôi, di chuyển với sự chính xác và tập trung, bắt đầu chuẩn bị các thành phần cho ngày hôm đó. Mọi thứ đều được cân đo đong đếm một cách tỉ mỉ. Tiếng máy trộn đều đặn, tiếng lòng trắng trứng được đánh bông tạo thành những chóp mềm, tất cả tạo nên một bản giao hưởng buổi sáng của căn bếp.</p>
      <img src="https://images.unsplash.com/photo-1606283993359-b3b3a32a6f24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxwYXN0cnklMjBraXRjaGVufGVufDB8fHx8MTc2Njk3NjY2NXww&ixlib=rb-4.1.0&q=80&w=1080" alt="Các đầu bếp đang làm việc trong một căn bếp chuyên nghiệp" class="my-8 rounded-lg shadow-lg" data-ai-hint="professional kitchen">
      <h2>Sự Tập Trung Buổi Chiều</h2>
      <p>Giữa buổi sáng là thời gian lắp ráp. Các lớp mousse, cremieux và bạt bánh được xếp chồng lên nhau một cách cẩn thận. Buổi chiều là lúc dành cho công đoạn hoàn thiện: đổ men, phun phủ và trang trí. Đây là lúc sự sáng tạo của mỗi đầu bếp được thăng hoa. Mỗi chiếc bánh đều được kiểm tra kỹ lưỡng trước khi được đặt vào hộp, sẵn sàng cho hành trình đến với khách hàng. Đó là một bản giao hưởng của sự chăm chỉ, kỹ năng và niềm đam mê, tất cả để tạo ra một khoảnh khắc ngọt ngào cho bạn.</p>
    `
  },
  {
    id: 'news-12',
    slug: 'the-beauty-of-simplicity-our-petit-cakes',
    title: 'Vẻ Đẹp Của Sự Đơn Giản: Những Chiếc Bánh Petit Của Chúng Tôi',
    excerpt: 'Đôi khi, những điều tuyệt vời nhất lại đến từ những thứ nhỏ bé nhất. Khám phá bộ sưu tập bánh petit của chúng tôi.',
    date: 'Ngày 26 tháng 6, 2024',
    category: 'Khám phá hương vị',
    imageId: 'blog-12',
    content: `
      <h2>Niềm Vui Nhỏ Bé</h2>
      <p>Trong một thế giới luôn vận động, đôi khi chúng ta chỉ cần một khoảnh khắc nhỏ bé để nuông chiều bản thân. Đó chính là nguồn cảm hứng cho Bộ sưu tập Baby (Petit) của chúng tôi. Những chiếc bánh này là phiên bản thu nhỏ của các hương vị đặc trưng của Vibary, được chế tác với cùng sự chăm chút và tỉ mỉ.</p>
      <img src="https://images.unsplash.com/photo-1587314168485-3236d6710814?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxwZXRpdCUyMGZvdXJzfGVufDB8fHx8MTc2NzA2MjAwNHww&ixlib=rb-4.1.0&q=80&w=1080" alt="Những chiếc bánh petit fours nhỏ xinh được bày trên đĩa" class="my-8 rounded-lg shadow-lg" data-ai-hint="petit fours">
      <h2>Hương Vị Trọn Vẹn</h2>
      <p>Với kích thước hoàn hảo cho một hoặc hai người, chúng là món quà lý tưởng cho bản thân sau một ngày dài, hoặc một cách ngọt ngào để nói lời cảm ơn với ai đó. Mặc dù nhỏ bé về kích thước, chúng vẫn mang đầy đủ sự phức tạp về hương vị và kết cấu của những người anh em lớn hơn. Từ mousse mềm mịn đến lớp đế giòn tan, mỗi miếng bánh đều là một trải nghiệm trọn vẹn. Hãy thử một chiếc Baby Mango Bliss và cảm nhận niềm vui lan tỏa.</p>
    `
  }
];

export const faqs: FaqItem[] = [
    {
        id: 'faq-1',
        question: 'Thời gian đặt bánh trước tối thiểu là bao lâu?',
        answer: 'Để đảm bảo chất lượng tốt nhất, bạn vui lòng đặt bánh trước ít nhất 24 giờ. Đối với các đơn hàng đặc biệt hoặc số lượng lớn, chúng tôi khuyến khích bạn đặt trước 48-72 giờ.'
    },
    {
        id: 'faq-2',
        question: 'Phí giao hàng của VIBARY được tính như thế nào?',
        answer: 'Phí giao hàng được tính dựa trên khoảng cách từ bếp của chúng tôi đến địa chỉ của bạn. Bạn có thể xem phí giao hàng chính xác sau khi nhập địa chỉ ở trang thanh toán.'
    },
    {
        id: 'faq-3',
        question: 'Tôi có thể đến mua bánh trực tiếp tại xưởng của VIBARY không?',
        answer: 'Hiện tại, VIBARY hoạt động theo mô hình bếp trung tâm và chỉ bán hàng trực tuyến để đảm bảo chất lượng sản phẩm tốt nhất khi đến tay khách hàng. Chúng tôi không có cửa hàng bán lẻ trực tiếp.'
    },
    {
        id: 'faq-4',
        question: 'VIBARY có các hình thức thanh toán nào?',
        answer: 'Chúng tôi chấp nhận thanh toán qua Momo, ZaloPay, chuyển khoản ngân hàng và thanh toán tiền mặt khi nhận hàng (COD).'
    },
    {
        id: 'faq-5',
        question: 'Tôi có thể chọn giờ giao hàng không?',
        answer: 'Có, bạn có thể chọn ngày và khung giờ giao hàng mong muốn tại trang thanh toán. Chúng tôi sẽ cố gắng hết sức để giao hàng trong khoảng thời gian bạn đã chọn.'
    },
    {
        id: 'faq-6',
        question: 'Nếu bánh giao đến bị xô lệch/ hình thức không còn nguyên vẹn do lỗi của shipper thì tôi phải làm thế nào?',
        answer: 'Chúng tôi rất tiếc về trải nghiệm này. Vui lòng kiểm tra kỹ bánh khi nhận hàng. Nếu có bất kỳ vấn đề gì về hình thức, bạn có quyền từ chối nhận hàng và liên hệ ngay với hotline của chúng tôi để được hỗ trợ giải quyết và sắp xếp một đơn hàng mới.'
    },
     {
        id: 'faq-7',
        question: 'Sau khi tôi nhận bánh & shipper đã ra về thì mới phát hiện bánh bị xô lệch/ hình thức không nguyên vẹn thì tôi phải làm thế nào?',
        answer: 'VIBARY rất tiếc nhưng chúng tôi không thể giải quyết các khiếu nại về hình thức bánh sau khi bạn đã nhận hàng và shipper đã rời đi. Việc đồng kiểm tra sản phẩm khi nhận là rất quan trọng. Mong bạn thông cảm.'
    },
     {
        id: 'faq-8',
        question: 'Tôi có thể đặt bánh theo mẫu riêng mà tôi muốn được không?',
        answer: 'Do đặc thù của dòng bánh Entremet, chúng tôi hiện không nhận làm bánh theo mẫu riêng. Tuy nhiên, chúng tôi có thể hỗ trợ viết lời chúc theo yêu cầu trên một tấm thẻ sô cô la.'
    },
     {
        id: 'faq-9',
        question: 'Tôi muốn di chuyển bánh từ nơi này đến nơi khác bằng xe máy/ ô tô thì có sợ bánh bị chảy không?',
        answer: 'Bánh của chúng tôi được giữ lạnh để đảm bảo kết cấu. Nếu bạn cần di chuyển, hãy đảm bảo bánh được giữ trong môi trường mát (tốt nhất là có đá khô hoặc trong thùng giữ nhiệt) và hạn chế di chuyển dưới trời nắng gắt quá 15-20 phút để tránh bánh bị chảy.'
    }
];
