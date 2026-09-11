const p = (id: string, w = 900) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

const productImageSets = {
  basicTee: [
    p('1656684'),
    p('11735074'),
    p('5698851'),
  ],
  blueJeans: [
    p('1082529'),
    p('1082526'),
    p('10133273'),
  ],
  plaidShirt: [
    p('31595181'),
    p('6995745'),
    p('5279232'),
  ],
  beigeDress: [
    p('28451296'),
    p('20102146'),
    p('13642252'),
  ],
  hoodie: [
    p('6311477'),
    p('17769664'),
    p('15127546'),
  ],
  khakiShorts: [
    p('18551488'),
    p('5036532'),
    p('6988089'),
  ],
  denimJacket: [
    p('36607477'),
    p('12083001'),
    p('5524406'),
  ],
  floralDress: [
    p('29277214'),
    p('38808677'),
    p('31683080'),
  ],
  whiteSneaker: [
    p('11513443'),
    p('2529148'),
  ],
  brownLoafer: [
    p('27204303'),
    p('15127353'),
    p('18054235'),
  ],
  canvasTote: [
    p('17836626'),
    p('19245662'),
    p('34393372'),
  ],
  crossbodyBag: [
    p('12442673'),
    p('8801132'),
    p('10106033'),
  ],
  bucketHat: [
    p('6069764'),
    p('14144267'),
    p('7956539'),
  ],
  mensPolo: [
    p('6840337'),
    p('29381847'),
    p('17987935'),
  ],
  blackJogger: [
    p('6670893'),
    p('9901666'),
    p('28223638'),
  ],
  bomberJacket: [
    p('19781191'),
    p('31545997'),
    p('5524406'),
  ],
};

export type ProductColor = {
  name: string;
  hex: string;
};

export type ProductVariant = {
  id: number;
  color: string;
  size: string;
  sku: string;
  price: number;
  stock: number;
};

function createStock(colorCount: number, sizeCount: number, seed: number) {
  return Array.from({ length: colorCount }, (_, colorIndex) =>
    Array.from({ length: sizeCount }, (_, sizeIndex) =>
      (seed + colorIndex * 4 + sizeIndex * 2) % 10
    )
  );
}

export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  brand: string;
  description: string;
  image: string;
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  stockByVariant: number[][];
  variants?: ProductVariant[];
  oldPrice?: number;
  sqlId?: number;
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  isNew?: boolean;
};

export type PriceSort = 'none' | 'asc' | 'desc';

export type Category = {
  name: string;
  image: string;
};

export type Banner = {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  image: string;
};

export const banners: Banner[] = [
  {
    id: 'b1',
    title: 'Mùa thu mới',
    subtitle: 'Áo khoác & hoodie giảm đến 40%',
    cta: 'Mua ngay',
    image: p('6311477', 1400),
  },
  {
    id: 'b2',
    title: 'Hàng mới về',
    subtitle: 'Áo thun, váy và phụ kiện vừa lên kệ',
    cta: 'Xem bộ sưu tập',
    image: p('29277214', 1400),
  },
  {
    id: 'b3',
    title: 'Hoàn thiện outfit',
    subtitle: 'Giày sneaker, loafer, túi tote và nón',
    cta: 'Khám phá',
    image: p('11513443', 1400),
  },
];

export const categories: Category[] = [
  { name: 'Áo', image: p('1656684', 700) },
  { name: 'Quần', image: p('1082529', 700) },
  { name: 'Áo khoác', image: p('36607477', 700) },
  { name: 'Váy', image: p('29277214', 700) },
  { name: 'Giày', image: p('11513443', 700) },
  { name: 'Phụ kiện', image: p('17836626', 700) },
];

export const brands = ['FASHION', 'YOUNG STYLE', 'URBAN WEAR'];

const legacyProducts: Product[] = [
  {
    id: '1',
    name: 'Áo thun trắng basic',
    price: 199000,
    category: 'Áo',
    brand: 'Coolmate',
    description: 'Áo thun cotton 100%, form regular, cổ tròn. Mềm, thoáng, mặc hằng ngày.',
    image: productImageSets.basicTee[0],
    images: productImageSets.basicTee,
    colors: [
      { name: 'Trắng', hex: '#F4F1EC' },
      { name: 'Đen', hex: '#1A1A1A' },
      { name: 'Be', hex: '#D9CDB8' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stockByVariant: createStock(3, 4, 2),
    rating: 4.8,
    reviewCount: 214,
    isFeatured: true,
    isNew: true,
  },
  {
    id: '2',
    name: 'Quần jean xanh nam',
    price: 399000,
    category: 'Quần',
    brand: 'Uniqlo',
    description: 'Jean ống đứng, denim dày, wash xanh cổ điển. Dễ phối áo thun hoặc sơ mi.',
    image: productImageSets.blueJeans[0],
    images: productImageSets.blueJeans,
    colors: [
      { name: 'Xanh đậm', hex: '#2C4A6E' },
      { name: 'Xanh nhạt', hex: '#7FA3C9' },
    ],
    sizes: ['28', '30', '32', '34'],
    stockByVariant: createStock(2, 4, 5),
    rating: 4.6,
    reviewCount: 168,
    isFeatured: true,
  },
  {
    id: '3',
    name: 'Áo sơ mi kẻ caro',
    price: 289000,
    category: 'Áo',
    brand: 'Zara',
    description: 'Sơ mi flannel kẻ caro, dài tay, form vừa. Mặc đi học hoặc đi làm.',
    image: productImageSets.plaidShirt[0],
    images: productImageSets.plaidShirt,
    colors: [
      { name: 'Caro đỏ', hex: '#8B3A2F' },
      { name: 'Caro xanh', hex: '#3D5A73' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stockByVariant: createStock(2, 4, 7),
    rating: 4.5,
    reviewCount: 97,
    isNew: true,
  },
  {
    id: '4',
    name: 'Váy liền màu be',
    price: 349000,
    category: 'Váy',
    brand: 'Zara',
    description: 'Váy midi be, dáng A nhẹ, chất liệu thoáng. Phù hợp mùa hè và dạo phố.',
    image: productImageSets.beigeDress[0],
    images: productImageSets.beigeDress,
    colors: [
      { name: 'Be', hex: '#D8C7A8' },
      { name: 'Trắng kem', hex: '#F3EDE3' },
    ],
    sizes: ['S', 'M', 'L'],
    stockByVariant: createStock(2, 3, 4),
    rating: 4.7,
    reviewCount: 142,
    isFeatured: true,
  },
  {
    id: '5',
    name: 'Áo khoác hoodie',
    price: 459000,
    category: 'Áo khoác',
    brand: 'Nike',
    description: 'Hoodie nỉ, túi kangaroo, mũ rộng. Mặc ấm, form sporty.',
    image: productImageSets.hoodie[0],
    images: productImageSets.hoodie,
    colors: [
      { name: 'Xám', hex: '#9A9A9A' },
      { name: 'Đen', hex: '#1A1A1A' },
      { name: 'Navy', hex: '#1E2A44' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stockByVariant: createStock(3, 4, 1),
    rating: 4.9,
    reviewCount: 301,
    isFeatured: true,
    isNew: true,
  },
  {
    id: '6',
    name: 'Quần short kaki',
    price: 229000,
    category: 'Quần',
    brand: 'Coolmate',
    description: 'Short kaki trên gối, có túi, form thoải mái cho cuối tuần.',
    image: productImageSets.khakiShorts[0],
    images: productImageSets.khakiShorts,
    colors: [
      { name: 'Kaki', hex: '#C4B08A' },
      { name: 'Olive', hex: '#6B6A3A' },
    ],
    sizes: ['28', '30', '32', '34'],
    stockByVariant: createStock(2, 4, 3),
    rating: 4.4,
    reviewCount: 76,
    isNew: true,
  },
  {
    id: '7',
    name: 'Áo khoác denim',
    price: 529000,
    category: 'Áo khoác',
    brand: 'Uniqlo',
    description: 'Khoác jean mỏng, cổ ve, mặc lớp ngoài cho outfit casual.',
    image: productImageSets.denimJacket[0],
    images: productImageSets.denimJacket,
    colors: [
      { name: 'Xanh jean', hex: '#4A6FA5' },
      { name: 'Đen', hex: '#222' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stockByVariant: createStock(2, 4, 6),
    rating: 4.6,
    reviewCount: 119,
    isNew: true,
  },
  {
    id: '8',
    name: 'Váy hoa nhí',
    price: 379000,
    category: 'Váy',
    brand: 'Local Brand',
    description: 'Váy xòe họa tiết hoa nhí, dáng nữ tính, phù hợp đi chơi.',
    image: productImageSets.floralDress[0],
    images: productImageSets.floralDress,
    colors: [
      { name: 'Hoa đỏ', hex: '#A33A3A' },
      { name: 'Hoa xanh', hex: '#5B7C8A' },
    ],
    sizes: ['S', 'M', 'L'],
    stockByVariant: createStock(2, 3, 8),
    rating: 4.7,
    reviewCount: 88,
  },
  {
    id: '9',
    name: 'Giày sneaker trắng',
    price: 499000,
    category: 'Giày',
    brand: 'Nike',
    description: 'Sneaker trắng da tổng hợp, đế êm, dễ phối mọi outfit.',
    image: productImageSets.whiteSneaker[0],
    images: productImageSets.whiteSneaker,
    colors: [
      { name: 'Trắng', hex: '#F5F5F5' },
      { name: 'Trắng kem', hex: '#EFE6D9' },
    ],
    sizes: ['38', '39', '40', '41', '42'],
    stockByVariant: createStock(2, 5, 2),
    rating: 4.8,
    reviewCount: 256,
    isFeatured: true,
    isNew: true,
  },
  {
    id: '10',
    name: 'Giày loafer nâu',
    price: 559000,
    category: 'Giày',
    brand: 'Zara',
    description: 'Loafer da nâu, form công sở, đi làm hoặc đi sự kiện nhẹ.',
    image: productImageSets.brownLoafer[0],
    images: productImageSets.brownLoafer,
    colors: [
      { name: 'Nâu', hex: '#6B3F2A' },
      { name: 'Đen', hex: '#1A1A1A' },
    ],
    sizes: ['39', '40', '41', '42', '43'],
    stockByVariant: createStock(2, 5, 5),
    rating: 4.5,
    reviewCount: 64,
  },
  {
    id: '11',
    name: 'Túi tote canvas',
    price: 259000,
    category: 'Phụ kiện',
    brand: 'Local Brand',
    description: 'Túi tote canvas rộng, quai dài, đựng sách và đồ cá nhân.',
    image: productImageSets.canvasTote[0],
    images: productImageSets.canvasTote,
    colors: [
      { name: 'Be canvas', hex: '#E6D5B8' },
      { name: 'Đen', hex: '#1A1A1A' },
    ],
    sizes: ['Free size'],
    stockByVariant: createStock(2, 1, 4),
    rating: 4.6,
    reviewCount: 133,
    isFeatured: true,
  },
  {
    id: '12',
    name: 'Nón bucket be',
    price: 129000,
    category: 'Phụ kiện',
    brand: 'Uniqlo',
    description: 'Nón bucket vải be, vành mềm, chống nắng nhẹ khi dạo phố.',
    image: productImageSets.bucketHat[0],
    images: productImageSets.bucketHat,
    colors: [
      { name: 'Be', hex: '#D7C4A3' },
      { name: 'Đen', hex: '#1A1A1A' },
    ],
    sizes: ['Free size'],
    stockByVariant: createStock(2, 1, 7),
    rating: 4.3,
    reviewCount: 51,
    isNew: true,
  },
  {
    id: '13',
    name: 'Áo polo navy',
    price: 249000,
    category: 'Áo',
    brand: 'Coolmate',
    description: 'Polo cotton pique navy, cổ bo, lịch sự mà vẫn thoải mái.',
    image: productImageSets.mensPolo[0],
    images: productImageSets.mensPolo,
    colors: [
      { name: 'Navy', hex: '#1E2A44' },
      { name: 'Trắng', hex: '#F4F1EC' },
      { name: 'Đen', hex: '#1A1A1A' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stockByVariant: createStock(3, 4, 5),
    rating: 4.7,
    reviewCount: 190,
    isFeatured: true,
  },
  {
    id: '14',
    name: 'Quần jogger đen',
    price: 319000,
    category: 'Quần',
    brand: 'Nike',
    description: 'Jogger nỉ đen, bo gấu, túi sườn. Mặc gym hoặc ở nhà.',
    image: productImageSets.blackJogger[0],
    images: productImageSets.blackJogger,
    colors: [
      { name: 'Đen', hex: '#1A1A1A' },
      { name: 'Xám', hex: '#8C8C8C' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stockByVariant: createStock(2, 4, 8),
    rating: 4.6,
    reviewCount: 147,
    isNew: true,
  },
];

function createSqlProduct(input: {
  id: string;
  sqlId: number;
  name: string;
  category: string;
  brand: string;
  description: string;
  price: number;
  oldPrice: number;
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  variants: ProductVariant[];
  isNew: boolean;
  isFeatured: boolean;
  rating?: number;
  reviewCount?: number;
}): Product {
  return {
    ...input,
    image: input.images[0],
    rating: input.rating ?? 0,
    reviewCount: input.reviewCount ?? 0,
    stockByVariant: input.colors.map((color) =>
      input.sizes.map(
        (size) =>
          input.variants.find((variant) => variant.color === color.name && variant.size === size)
            ?.stock ?? 0
      )
    ),
  };
}

export const products: Product[] = [
  createSqlProduct({
    id: '1',
    sqlId: 1,
    name: 'Áo Polo Nam Basic',
    category: 'Áo',
    brand: 'FASHION',
    description: 'Áo polo nam phong cách đơn giản, chất liệu cotton mềm mại, phù hợp đi học và đi chơi.',
    price: 199000,
    oldPrice: 249000,
    images: productImageSets.mensPolo,
    colors: [
      { name: 'Đen', hex: '#000000' },
      { name: 'Trắng', hex: '#FFFFFF' },
      { name: 'Xanh', hex: '#0000FF' },
    ],
    sizes: ['S', 'M', 'L'],
    variants: [
      { id: 1, color: 'Đen', size: 'S', sku: 'POLO-DEN-S', price: 199000, stock: 10 },
      { id: 2, color: 'Đen', size: 'M', sku: 'POLO-DEN-M', price: 199000, stock: 15 },
      { id: 3, color: 'Đen', size: 'L', sku: 'POLO-DEN-L', price: 199000, stock: 12 },
      { id: 4, color: 'Trắng', size: 'M', sku: 'POLO-TRANG-M', price: 199000, stock: 10 },
      { id: 5, color: 'Trắng', size: 'L', sku: 'POLO-TRANG-L', price: 199000, stock: 8 },
      { id: 6, color: 'Xanh', size: 'L', sku: 'POLO-XANH-L', price: 199000, stock: 8 },
    ],
    isNew: true,
    isFeatured: true,
  }),
  createSqlProduct({
    id: '2',
    sqlId: 2,
    name: 'Áo Thun Nam Oversize',
    category: 'Áo',
    brand: 'YOUNG STYLE',
    description: 'Áo thun oversize phong cách trẻ trung, phù hợp với phong cách thời trang hiện đại.',
    price: 149000,
    oldPrice: 199000,
    images: productImageSets.basicTee,
    colors: [{ name: 'Đen', hex: '#000000' }, { name: 'Trắng', hex: '#FFFFFF' }],
    sizes: ['S', 'M', 'L'],
    variants: [
      { id: 7, color: 'Đen', size: 'S', sku: 'TSHIRT-DEN-S', price: 149000, stock: 15 },
      { id: 8, color: 'Đen', size: 'M', sku: 'TSHIRT-DEN-M', price: 149000, stock: 20 },
      { id: 9, color: 'Đen', size: 'L', sku: 'TSHIRT-DEN-L', price: 149000, stock: 15 },
      { id: 10, color: 'Trắng', size: 'M', sku: 'TSHIRT-TRANG-M', price: 149000, stock: 10 },
      { id: 11, color: 'Trắng', size: 'L', sku: 'TSHIRT-TRANG-L', price: 149000, stock: 10 },
    ],
    isNew: true,
    isFeatured: true,
  }),
  createSqlProduct({
    id: '3',
    sqlId: 3,
    name: 'Áo Sơ Mi Nam Công Sở',
    category: 'Áo',
    brand: 'URBAN WEAR',
    description: 'Áo sơ mi nam thiết kế thanh lịch, phù hợp đi học và đi làm.',
    price: 259000,
    oldPrice: 299000,
    images: productImageSets.plaidShirt,
    colors: [{ name: 'Trắng', hex: '#FFFFFF' }, { name: 'Đen', hex: '#000000' }],
    sizes: ['M', 'L'],
    variants: [
      { id: 12, color: 'Trắng', size: 'M', sku: 'SHIRT-TRANG-M', price: 259000, stock: 10 },
      { id: 13, color: 'Trắng', size: 'L', sku: 'SHIRT-TRANG-L', price: 259000, stock: 10 },
      { id: 14, color: 'Đen', size: 'L', sku: 'SHIRT-DEN-L', price: 259000, stock: 7 },
    ],
    isNew: false,
    isFeatured: true,
  }),
  createSqlProduct({
    id: '4',
    sqlId: 4,
    name: 'Quần Jean Nam Classic',
    category: 'Quần',
    brand: 'FASHION',
    description: 'Quần jean nam kiểu dáng hiện đại, dễ phối với nhiều loại áo.',
    price: 299000,
    oldPrice: 349000,
    images: productImageSets.blueJeans,
    colors: [{ name: 'Đen', hex: '#000000' }, { name: 'Xanh', hex: '#0000FF' }],
    sizes: ['M', 'L', 'XL'],
    variants: [
      { id: 15, color: 'Đen', size: 'M', sku: 'JEAN-DEN-M', price: 299000, stock: 10 },
      { id: 16, color: 'Đen', size: 'L', sku: 'JEAN-DEN-L', price: 299000, stock: 12 },
      { id: 17, color: 'Xanh', size: 'XL', sku: 'JEAN-XANH-XL', price: 299000, stock: 8 },
    ],
    isNew: false,
    isFeatured: true,
  }),
  createSqlProduct({
    id: '5',
    sqlId: 5,
    name: 'Quần Jogger Nam',
    category: 'Quần',
    brand: 'URBAN WEAR',
    description: 'Quần jogger nam thoải mái, phù hợp mặc hàng ngày.',
    price: 249000,
    oldPrice: 299000,
    images: productImageSets.blackJogger,
    colors: [{ name: 'Đen', hex: '#000000' }, { name: 'Xám', hex: '#808080' }],
    sizes: ['M', 'L'],
    variants: [
      { id: 18, color: 'Đen', size: 'M', sku: 'JOGGER-DEN-M', price: 249000, stock: 10 },
      { id: 19, color: 'Đen', size: 'L', sku: 'JOGGER-DEN-L', price: 249000, stock: 10 },
      { id: 20, color: 'Xám', size: 'L', sku: 'JOGGER-XAM-L', price: 249000, stock: 7 },
    ],
    isNew: true,
    isFeatured: false,
  }),
  createSqlProduct({
    id: '6',
    sqlId: 6,
    name: 'Áo Khoác Bomber',
    category: 'Áo khoác',
    brand: 'YOUNG STYLE',
    description: 'Áo khoác bomber phong cách trẻ trung, thích hợp thời tiết se lạnh.',
    price: 399000,
    oldPrice: 499000,
    images: productImageSets.bomberJacket,
    colors: [{ name: 'Đen', hex: '#000000' }, { name: 'Xanh', hex: '#0000FF' }],
    sizes: ['M', 'L'],
    variants: [
      { id: 21, color: 'Đen', size: 'M', sku: 'BOMBER-DEN-M', price: 399000, stock: 8 },
      { id: 22, color: 'Đen', size: 'L', sku: 'BOMBER-DEN-L', price: 399000, stock: 10 },
      { id: 23, color: 'Xanh', size: 'L', sku: 'BOMBER-XANH-L', price: 399000, stock: 6 },
    ],
    isNew: true,
    isFeatured: true,
  }),
  createSqlProduct({
    id: '7',
    sqlId: 7,
    name: 'Áo Khoác Hoodie',
    category: 'Áo khoác',
    brand: 'URBAN WEAR',
    description: 'Hoodie nam nữ phong cách năng động, chất liệu nỉ mềm.',
    price: 349000,
    oldPrice: 399000,
    images: productImageSets.hoodie,
    colors: [{ name: 'Đen', hex: '#000000' }, { name: 'Xám', hex: '#808080' }],
    sizes: ['M', 'L'],
    variants: [
      { id: 24, color: 'Đen', size: 'M', sku: 'HOODIE-DEN-M', price: 349000, stock: 10 },
      { id: 25, color: 'Đen', size: 'L', sku: 'HOODIE-DEN-L', price: 349000, stock: 12 },
      { id: 26, color: 'Xám', size: 'L', sku: 'HOODIE-XAM-L', price: 349000, stock: 8 },
    ],
    isNew: true,
    isFeatured: true,
  }),
  createSqlProduct({
    id: '8',
    sqlId: 8,
    name: 'Váy Nữ Thanh Lịch',
    category: 'Váy',
    brand: 'FASHION',
    description: 'Váy nữ thiết kế thanh lịch, phù hợp đi chơi và dự tiệc.',
    price: 329000,
    oldPrice: 399000,
    images: productImageSets.beigeDress,
    colors: [{ name: 'Trắng', hex: '#FFFFFF' }, { name: 'Đỏ', hex: '#FF0000' }],
    sizes: ['S', 'M'],
    variants: [
      { id: 27, color: 'Trắng', size: 'S', sku: 'VAY-TRANG-S', price: 329000, stock: 10 },
      { id: 28, color: 'Trắng', size: 'M', sku: 'VAY-TRANG-M', price: 329000, stock: 12 },
      { id: 29, color: 'Đỏ', size: 'M', sku: 'VAY-DO-M', price: 329000, stock: 8 },
    ],
    isNew: true,
    isFeatured: false,
  }),
  createSqlProduct({
    id: '9',
    sqlId: 9,
    name: 'Giày Sneaker Basic',
    category: 'Giày',
    brand: 'YOUNG STYLE',
    description: 'Giày sneaker phong cách đơn giản, dễ phối đồ.',
    price: 499000,
    oldPrice: 599000,
    images: productImageSets.whiteSneaker,
    colors: [{ name: 'Đen', hex: '#000000' }, { name: 'Trắng', hex: '#FFFFFF' }],
    sizes: ['L'],
    variants: [
      { id: 30, color: 'Đen', size: 'L', sku: 'GIAY-DEN-L', price: 499000, stock: 10 },
      { id: 31, color: 'Trắng', size: 'L', sku: 'GIAY-TRANG-L', price: 499000, stock: 8 },
    ],
    isNew: true,
    isFeatured: true,
  }),
  createSqlProduct({
    id: '10',
    sqlId: 10,
    name: 'Túi Đeo Chéo Mini',
    category: 'Phụ kiện',
    brand: 'FASHION',
    description: 'Túi đeo chéo nhỏ gọn, phù hợp đi chơi và đi học.',
    price: 159000,
    oldPrice: 199000,
    images: productImageSets.crossbodyBag,
    colors: [{ name: 'Đen', hex: '#000000' }, { name: 'Be', hex: '#F5F5DC' }],
    sizes: ['S'],
    variants: [
      { id: 32, color: 'Đen', size: 'S', sku: 'TUI-DEN-S', price: 159000, stock: 15 },
      { id: 33, color: 'Be', size: 'S', sku: 'TUI-BE-S', price: 159000, stock: 10 },
    ],
    isNew: false,
    isFeatured: false,
  }),
  createSqlProduct({
    id: '11',
    sqlId: 11,
    name: 'Quần Short Kaki Nam',
    category: 'Quần',
    brand: 'FASHION',
    description: 'Quần short kaki nam gọn nhẹ, thoải mái cho những ngày năng động.',
    price: 219000,
    oldPrice: 269000,
    images: productImageSets.khakiShorts,
    colors: [{ name: 'Be', hex: '#D9CDB8' }, { name: 'Đen', hex: '#1A1A1A' }],
    sizes: ['M', 'L', 'XL'],
    variants: [
      { id: 34, color: 'Be', size: 'M', sku: 'SHORT-BE-M', price: 219000, stock: 14 },
      { id: 35, color: 'Be', size: 'L', sku: 'SHORT-BE-L', price: 219000, stock: 12 },
      { id: 36, color: 'Đen', size: 'L', sku: 'SHORT-DEN-L', price: 219000, stock: 10 },
      { id: 37, color: 'Đen', size: 'XL', sku: 'SHORT-DEN-XL', price: 219000, stock: 8 },
    ],
    isNew: true,
    isFeatured: false,
  }),
  createSqlProduct({
    id: '12',
    sqlId: 12,
    name: 'Áo Khoác Denim Classic',
    category: 'Áo khoác',
    brand: 'YOUNG STYLE',
    description: 'Áo khoác denim cổ điển, dễ phối với áo thun và quần jean.',
    price: 459000,
    oldPrice: 549000,
    images: productImageSets.denimJacket,
    colors: [{ name: 'Xanh', hex: '#4D76A8' }, { name: 'Đen', hex: '#1A1A1A' }],
    sizes: ['M', 'L', 'XL'],
    variants: [
      { id: 38, color: 'Xanh', size: 'M', sku: 'DENIM-XANH-M', price: 459000, stock: 9 },
      { id: 39, color: 'Xanh', size: 'L', sku: 'DENIM-XANH-L', price: 459000, stock: 11 },
      { id: 40, color: 'Đen', size: 'L', sku: 'DENIM-DEN-L', price: 459000, stock: 7 },
    ],
    isNew: true,
    isFeatured: true,
  }),
  createSqlProduct({
    id: '13',
    sqlId: 13,
    name: 'Váy Hoa Mùa Hè',
    category: 'Váy',
    brand: 'FASHION',
    description: 'Váy hoa nhẹ nhàng, phom dáng thoải mái cho những buổi dạo phố.',
    price: 289000,
    oldPrice: 349000,
    images: productImageSets.floralDress,
    colors: [{ name: 'Hồng', hex: '#E8A0A8' }, { name: 'Xanh', hex: '#7FA3C9' }],
    sizes: ['S', 'M', 'L'],
    variants: [
      { id: 41, color: 'Hồng', size: 'S', sku: 'VAYHOA-HONG-S', price: 289000, stock: 10 },
      { id: 42, color: 'Hồng', size: 'M', sku: 'VAYHOA-HONG-M', price: 289000, stock: 12 },
      { id: 43, color: 'Xanh', size: 'M', sku: 'VAYHOA-XANH-M', price: 289000, stock: 8 },
    ],
    isNew: true,
    isFeatured: true,
  }),
  createSqlProduct({
    id: '14',
    sqlId: 14,
    name: 'Giày Loafer Da Mềm',
    category: 'Giày',
    brand: 'URBAN WEAR',
    description: 'Giày loafer da mềm, kiểu dáng lịch sự cho công sở và sự kiện.',
    price: 569000,
    oldPrice: 649000,
    images: productImageSets.brownLoafer,
    colors: [{ name: 'Nâu', hex: '#7A4E2D' }, { name: 'Đen', hex: '#1A1A1A' }],
    sizes: ['39', '40', '41'],
    variants: [
      { id: 44, color: 'Nâu', size: '39', sku: 'LOAFER-NAU-39', price: 569000, stock: 6 },
      { id: 45, color: 'Nâu', size: '40', sku: 'LOAFER-NAU-40', price: 569000, stock: 8 },
      { id: 46, color: 'Đen', size: '41', sku: 'LOAFER-DEN-41', price: 569000, stock: 5 },
    ],
    isNew: false,
    isFeatured: true,
  }),
  createSqlProduct({
    id: '15',
    sqlId: 15,
    name: 'Túi Tote Canvas Everyday',
    category: 'Phụ kiện',
    brand: 'YOUNG STYLE',
    description: 'Túi tote canvas rộng rãi, tiện dụng cho đi học và đi làm.',
    price: 129000,
    oldPrice: 159000,
    images: productImageSets.canvasTote,
    colors: [{ name: 'Trắng', hex: '#F4F1EC' }, { name: 'Đen', hex: '#1A1A1A' }],
    sizes: ['S'],
    variants: [
      { id: 47, color: 'Trắng', size: 'S', sku: 'TOTE-TRANG-S', price: 129000, stock: 20 },
      { id: 48, color: 'Đen', size: 'S', sku: 'TOTE-DEN-S', price: 129000, stock: 16 },
    ],
    isNew: true,
    isFeatured: false,
  }),
  createSqlProduct({
    id: '16',
    sqlId: 16,
    name: 'Nón Bucket Basic',
    category: 'Phụ kiện',
    brand: 'FASHION',
    description: 'Nón bucket basic dễ phối đồ, phù hợp đi chơi và dạo phố.',
    price: 99000,
    oldPrice: 129000,
    images: productImageSets.bucketHat,
    colors: [{ name: 'Be', hex: '#D9CDB8' }, { name: 'Đen', hex: '#1A1A1A' }],
    sizes: ['S'],
    variants: [
      { id: 49, color: 'Be', size: 'S', sku: 'BUCKET-BE-S', price: 99000, stock: 18 },
      { id: 50, color: 'Đen', size: 'S', sku: 'BUCKET-DEN-S', price: 99000, stock: 15 },
    ],
    isNew: true,
    isFeatured: false,
  }),
];

export const favoriteIds = ['1', '5', '6'];

export function getProductVariantStock(product: Product, colorIndex: number, sizeIndex: number) {
  return product.stockByVariant[colorIndex]?.[sizeIndex] ?? 0;
}

export function formatPrice(price: number) {
  return `${price.toLocaleString('vi-VN')}₫`;
}

export function getProductById(id: string) {
  return products.find((item) => item.id === id);
}

export function getProductsByCategory(category: string) {
  return products.filter((item) => item.category === category);
}

export function getFeaturedProducts() {
  return products.filter((item) => item.isFeatured);
}

export function getNewProducts() {
  return products.filter((item) => item.isNew);
}

export function getRelatedProducts(productId: string) {
  const product = getProductById(productId);
  if (!product) {
    return [];
  }
  return products
    .filter(
      (item) =>
        item.id !== productId &&
        (item.category === product.category || item.brand === product.brand)
    )
    .slice(0, 6);
}

export function filterProducts(options: {
  query?: string;
  category?: string;
  brand?: string;
  sort?: PriceSort;
}) {
  const query = (options.query ?? '').trim().toLowerCase();
  let result = products.filter((item) => {
    const matchQuery =
      query.length === 0 ||
      item.name.toLowerCase().includes(query) ||
      item.brand.toLowerCase().includes(query);
    const matchCategory = !options.category || item.category === options.category;
    const matchBrand = !options.brand || item.brand === options.brand;
    return matchQuery && matchCategory && matchBrand;
  });

  if (options.sort === 'asc') {
    result = [...result].sort((a, b) => a.price - b.price);
  }
  if (options.sort === 'desc') {
    result = [...result].sort((a, b) => b.price - a.price);
  }

  return result;
}

export function getFavoriteProducts() {
  return products.filter((item) => favoriteIds.includes(item.id));
}
