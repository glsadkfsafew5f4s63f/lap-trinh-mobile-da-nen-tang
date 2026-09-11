import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { mockUser } from '../data/user';
import { useAuth } from './AuthContext';

export type ProductReview = {
  id: string;
  productId: string;
  author: string;
  stars: number;
  comment: string;
  date: string;
};

type ReviewContextValue = {
  getReviews: (productId: string) => ProductReview[];
  addReview: (review: Omit<ProductReview, 'id' | 'date'>) => void;
};

const initialReviews: ProductReview[] = [
  {
    id: 'review-1',
    productId: '1',
    author: 'Minh Anh',
    stars: 5,
    comment: 'Vải mềm, form đẹp và đúng như hình. Mặc hằng ngày rất tiện.',
    date: '08/09/2026',
  },
  {
    id: 'review-2',
    productId: '4',
    author: 'Trần Văn Bình',
    stars: 5,
    comment: 'Quần đẹp, đúng mô tả và giao hàng nhanh.',
    date: '07/09/2026',
  },
];

const ReviewContext = createContext<ReviewContextValue | null>(null);

export function ReviewProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userKey = user?.phone ?? '';
  const [reviewsByUser, setReviewsByUser] = useState<Record<string, ProductReview[]>>({
    [mockUser.phone]: initialReviews,
  });
  const reviews = reviewsByUser[userKey] ?? [];

  const value = useMemo(
    () => ({
      getReviews(productId: string) {
        return reviews.filter((review) => review.productId === productId);
      },
      addReview(review: Omit<ProductReview, 'id' | 'date'>) {
        if (userKey) {
          setReviewsByUser((allUsers) => ({
            ...allUsers,
            [userKey]: [
              {
                ...review,
                id: `review-${Date.now()}`,
                date: new Date().toLocaleDateString('vi-VN'),
              },
              ...(allUsers[userKey] ?? []),
            ],
          }));
        }
      },
    }),
    [reviews, userKey]
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
