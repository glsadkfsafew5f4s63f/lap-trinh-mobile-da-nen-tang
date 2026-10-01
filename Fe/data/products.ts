import { API_BASE_URL, getApiProductBundle, getApiProducts } from '../services/api';

export type ProductColor = { name: string; hex: string };
export type ProductVariant = { id: number; color: string; size: string; sku: string; price: number; stock: number };
export type Product = {
  id: string; name: string; price: number; category: string; brand: string; description: string;
  image: string; images: string[]; colors: ProductColor[]; sizes: string[]; stockByVariant: number[][];
  variants: ProductVariant[]; oldPrice?: number; sqlId?: number; rating: number; reviewCount: number;
  isFeatured?: boolean; isNew?: boolean;
};
export type PriceSort = 'none' | 'asc' | 'desc';
export type Category = { name: string; image: string };
export const categories: Category[] = [];
export const brands: string[] = [];
export const products: Product[] = [];

export function resolveProductImageUrl(value: string) {
  if (!value || /^https?:\/\//i.test(value)) return value;
  return `${API_BASE_URL}/${value.replace(/^\/+/, '')}`;
}

function parseImages(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is { url?: string } => Boolean(item && typeof item === 'object'))
    .map((item) => item.url)
    .filter((url): url is string => Boolean(url))
    .map(resolveProductImageUrl);
}

let catalogRequest: Promise<Product[]> | null = null;
let catalogLoaded = false;

export function loadProductsFromApi() {
  if (catalogLoaded) return Promise.resolve([...products]);
  if (catalogRequest) return catalogRequest;
  catalogRequest = getApiProducts()
    .then((apiProducts) => {
      const nextProducts = apiProducts.map((apiProduct): Product => {
        const images = parseImages(apiProduct.images);
        return {
          id: String(apiProduct.id), sqlId: apiProduct.id, name: apiProduct.name,
          description: apiProduct.description ?? '', price: Number(apiProduct.price) || 0,
          oldPrice: apiProduct.oldPrice == null ? undefined : Number(apiProduct.oldPrice),
          category: apiProduct.category || 'Chưa phân loại', brand: apiProduct.brand || '',
          image: images[0] || '', images, colors: [], sizes: [], variants: [], stockByVariant: [],
          rating: apiProduct.rating, reviewCount: apiProduct.reviewCount,
          isNew: Boolean(apiProduct.isNew), isFeatured: Boolean(apiProduct.isFeatured),
        };
      });
      products.splice(0, products.length, ...nextProducts);
      catalogLoaded = true;
      return nextProducts;
    })
    .finally(() => { catalogRequest = null; });
  return catalogRequest;
}

export async function loadProductDetailFromApi(productId: string) {
  const id = Number(productId);
  if (!Number.isInteger(id) || id <= 0) throw new Error('Mã sản phẩm không hợp lệ.');
  const bundle = await getApiProductBundle(id);
  const details = bundle.product;
  const variants = bundle.variants;
  const colorNames = Array.from(new Set(variants.map((variant) => variant.color).filter(Boolean)));
  const sizeNames = Array.from(new Set(variants.map((variant) => variant.size).filter(Boolean)));
  const colors = colorNames.map((name) => ({ name, hex: variants.find((variant) => variant.color === name)?.hex || '#808080' }));
  const stockByVariant = colors.map((color) => sizeNames.map((size) => variants.find((variant) => variant.color === color.name && variant.size === size)?.stock ?? 0));
  const images = parseImages(bundle.images);
  const current = getProductById(String(id));
  const product: Product = {
    id: String(id), sqlId: id,
    name: String(details.TenSanPham || current?.name || ''),
    description: String(details.MoTa || current?.description || ''),
    price: current?.price ?? Number(details.GiaBan || 0),
    category: String(details.TenDanhMuc || current?.category || 'Chưa phân loại'),
    brand: String(details.TenThuongHieu || current?.brand || ''),
    image: images[0] || current?.image || '',
    images: images.length ? images : current?.images || [],
    colors, sizes: sizeNames, variants, stockByVariant,
    rating: current?.rating ?? 0, reviewCount: current?.reviewCount ?? 0,
    isNew: current?.isNew, isFeatured: Number(details.NoiBat ?? current?.isFeatured ?? 0) === 1,
  };
  const index = products.findIndex((item) => item.id === product.id);
  if (index < 0) products.push(product);
  else products[index] = product;
  return product;
}

export function getProductVariantStock(product: Product, colorIndex: number, sizeIndex: number) { return product.stockByVariant[colorIndex]?.[sizeIndex] ?? 0; }
export function formatPrice(price: number) { return `${price.toLocaleString('vi-VN')}₫`; }
export function getProductById(id: string) { return products.find((item) => item.id === id); }
export function getProductsByCategory(category: string) { return products.filter((item) => item.category === category); }
export function getFeaturedProducts() { return products.filter((item) => item.isFeatured); }
export function getNewProducts() { return products.filter((item) => item.isNew); }
export function getRelatedProducts(productId: string) {
  const product = getProductById(productId);
  return product ? products.filter((item) => item.id !== productId && (item.category === product.category || item.brand === product.brand)).slice(0, 6) : [];
}
export function filterProducts(options: { query?: string; category?: string; brand?: string; sort?: PriceSort }) {
  const query = (options.query ?? '').trim().toLowerCase();
  let result = products.filter((item) => (!query || item.name.toLowerCase().includes(query) || item.brand.toLowerCase().includes(query)) && (!options.category || item.category === options.category) && (!options.brand || item.brand === options.brand));
  if (options.sort === 'asc') result = [...result].sort((a, b) => a.price - b.price);
  if (options.sort === 'desc') result = [...result].sort((a, b) => b.price - a.price);
  return result;
}
