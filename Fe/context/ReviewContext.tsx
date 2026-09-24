import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { createApiReview, getApiReviews } from '../services/api';
import { useAuth } from './AuthContext';

export type ProductReview = {
  id: string;
  productId: string;
  author: string;
  stars: number;
  comment: string;
  date: string;
  reply?: string;
};

type ReviewContextValue = {
  getReviews: (productId: string) => ProductReview[];
  loadReviews: (productId: string) => Promise<void>;
  addReview: (review: Omit<ProductReview, 'id' | 'date'>, orderId?: string) => Promise<string | null>;
};

const ReviewContext = createContext<ReviewContextValue | null>(null);

export function ReviewProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userKey = user?.phone ?? '';
  const [reviewsByUser, setReviewsByUser] = useState<Record<string, ProductReview[]>>({});
  const reviews = reviewsByUser[userKey] ?? [];

  const value = useMemo(
    () => ({
      getReviews(productId: string) {
        return reviews.filter((review) => review.productId === productId);
      },
      async loadReviews(productId: string) {
        try {
          const rows = await getApiReviews(Number(productId));
          const remoteReviews: ProductReview[] = rows.map((row) => ({
            id: String(row.id),
            productId: String(row.productId),
            author: row.author,
            stars: Number(row.stars),
            comment: row.comment,
            date: row.date ? new Date(row.date).toLocaleDateString('vi-VN') : '',
            reply: row.reply || '',
          }));
          setReviewsByUser((allUsers) => ({ ...allUsers, [userKey]: remoteReviews }));
        } catch {
          // Keep local reviews as a fallback when the API is unavailable.
        }
      },
      async addReview(review: Omit<ProductReview, 'id' | 'date'>, orderId?: string) {
        if (!user?.id || !orderId) {
          return 'Bạn cần đăng nhập và có đơn hàng hợp lệ để đánh giá.';
        }

        const numericOrderId = Number(orderId.replace(/\D/g, ''));
        if (!numericOrderId) {
          return 'Mã đơn hàng không hợp lệ.';
        }

        try {
          await createApiReview({
            userId: user.id,
            productId: Number(review.productId),
            orderId: numericOrderId,
            stars: review.stars,
            comment: review.comment,
          });
          const nextReview = {
            ...review,
            author: user.name,
            id: `review-${Date.now()}`,
            date: new Date().toLocaleDateString('vi-VN'),
          };
          setReviewsByUser((allUsers) => ({
            ...allUsers,
            [userKey]: [nextReview, ...(allUsers[userKey] ?? [])],
          }));
          return null;
        } catch (error) {
          return error instanceof Error ? error.message : 'Không thể gửi đánh giá.';
        }
      },
    }),
    [reviews, user, userKey]
  );

  return <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>;
}

export function useReviews() {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error('useReviews phải dùng trong ReviewProvider');
  }
  return context;
}
