import type { Category, CategoryId } from '@/types';

export const CATEGORIES: Category[] = [
  { id: 'needs', label: 'প্রয়োজন', en: 'Needs', icon: '🙋' },
  { id: 'people', label: 'মানুষ', en: 'People', icon: '👪' },
  { id: 'actions', label: 'কাজ', en: 'Actions', icon: '🏃' },
  { id: 'feelings', label: 'অনুভূতি', en: 'Feelings', icon: '🙂' },
  { id: 'places', label: 'জায়গা', en: 'Places', icon: '📍' },
  { id: 'food', label: 'খাবার-পানীয়', en: 'Food & drink', icon: '🍽️' },
  { id: 'health', label: 'স্বাস্থ্য', en: 'Health', icon: '🩺' },
  { id: 'phrases', label: 'সাধারণ কথা', en: 'Phrases', icon: '💬' },
  { id: 'emergency', label: 'জরুরি', en: 'Urgent', icon: '🚨' },
];

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<
  CategoryId,
  Category
>;
