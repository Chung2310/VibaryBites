

import type { Product, FaqItem } from './types';

export const products: Product[] = [
  {
    id: 'prod-001',
    slug: 'be-in-blossom',
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
    imageUrl: '/images/product/BeinBlossom2.avif',
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
    slug: 'beloved-darling',
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
    imageUrl: '/images/product/BelovedDarling2.avif',
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
    imageUrl: '/images/product/ALittleGrace2.avif',
    categorySlug: 'banh-tea-break',
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
    slug: 'summer-calling',
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
    imageUrl: '/images/product/OneSunnyDay2.avif',
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
    slug: 'a-gentle-blend',
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
    imageUrl: '/images/product/SecretGarden2.avif',
    categorySlug: 'banh-sinh-nhat',
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
    imageUrl: '/images/product/baby-mango-bliss.png',
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
    imageUrl: '/images/product/raspberry-pistachio-half.png',
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
    imageUrl: '/images/product/summer-berry-cheesecake.png',
    categorySlug: 'banh-nuong',
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
