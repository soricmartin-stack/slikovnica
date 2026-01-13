
export type LanguageCode = 'en' | 'de' | 'fr' | 'es' | 'it' | 'pt' | 'nl' | 'pl' | 'ru' | 'sv' | 'hr';
export type UserRole = 'admin' | 'user';

export interface Auth {
  role: UserRole;
  name: string;
}

export interface Language {
  code: LanguageCode;
  name: string;
  flag: string;
}

export interface Page {
  id: string;
  imageUrl: string;
  text: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  creatorName: string;
  isApproved: boolean;
  coverImage: string;
  language: LanguageCode;
  ageGroup: number;
  backgroundColor: string;
  pages: Page[];
  createdAt: number;
  universalRating: number;
  personalRating: number;
  publishStatus: 'local' | 'universal';
}

export type ViewState = 'language_select' | 'login' | 'library' | 'reader' | 'creator';

export interface Translations {
  [key: string]: {
    [code in LanguageCode]: string;
  };
}
