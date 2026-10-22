export type LatestNews = {
  _id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  publishedAt: string;
  sortOrder: number;
  created_at: string;
  updated_at: string;
};

export type CreateLatestNewsInput = {
  title: string;
  excerpt: string;
  publishedAt?: string;
  sortOrder?: number;
  image: File;
};

export type UpdateLatestNewsInput = {
  newsId: string;
  title: string;
  excerpt: string;
  publishedAt?: string;
  sortOrder?: number;
  image?: File | null;
};
