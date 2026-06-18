export type QaItemStatus = 'draft' | 'published' | 'archived';

export type QaCategory = {
  id: string;
  title: string;
  short_title?: string | null;
  slug: string;
  description?: string | null;
  order_index: number;
  is_active: boolean;
  created_by?: string | null;
  updated_by?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type QaItem = {
  id: string;
  category_id: string;
  question: string;
  answer: string;
  slug: string;
  keywords: string[];
  related_page_label?: string | null;
  related_page_path?: string | null;
  is_featured: boolean;
  status: QaItemStatus;
  order_index: number;
  published_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type QaPublishedContent = {
  categories: QaCategory[];
  items: QaItem[];
};
