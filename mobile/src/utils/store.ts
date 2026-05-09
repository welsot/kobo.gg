import { create } from 'zustand';
import type { TmpBookBundleDto, FinalizeBooksResponseDto } from '../api/apiSchemas';

export interface UploadedBook {
  id: string;
  name: string;
  key: string;
  size: number;
}

interface BookState {
  // Book bundle
  bookBundle: TmpBookBundleDto | null;
  setBookBundle: (bookBundle: TmpBookBundleDto | null) => void;
  
  // Uploaded books
  uploadedBooks: UploadedBook[];
  addBook: (book: UploadedBook) => void;
  removeBook: (bookId: string) => void;
  clearBooks: () => void;
  
  // Upload state
  isUploading: boolean;
  setIsUploading: (isUploading: boolean) => void;
  uploadProgress: number;
  setUploadProgress: (progress: number) => void;
  currentFileName: string;
  setCurrentFileName: (fileName: string) => void;
  
  // Finalization
  finalizationResult: FinalizeBooksResponseDto | null;
  setFinalizationResult: (result: FinalizeBooksResponseDto | null) => void;
  shortUrl: string | null;
  setShortUrl: (url: string | null) => void;
  
  // Helper functions
  resetUploadState: () => void;
  resetAll: () => void;
}

export const useBookStore = create<BookState>()((set) => ({
  // Book bundle
  bookBundle: null,
  setBookBundle: (bookBundle) => set({ bookBundle }),
  
  // Uploaded books
  uploadedBooks: [],
  addBook: (book) => set((state) => ({ 
    uploadedBooks: [...state.uploadedBooks, book] 
  })),
  removeBook: (bookId) => set((state) => ({ 
    uploadedBooks: state.uploadedBooks.filter(book => book.id !== bookId) 
  })),
  clearBooks: () => set({ uploadedBooks: [] }),
  
  // Upload state
  isUploading: false,
  setIsUploading: (isUploading) => set({ isUploading }),
  uploadProgress: 0,
  setUploadProgress: (uploadProgress) => set({ uploadProgress }),
  currentFileName: "",
  setCurrentFileName: (currentFileName) => set({ currentFileName }),
  
  // Finalization
  finalizationResult: null,
  setFinalizationResult: (finalizationResult) => set({ finalizationResult }),
  shortUrl: null,
  setShortUrl: (shortUrl) => set({ shortUrl }),
  
  // Reset all upload-related state
  resetUploadState: () => set({ 
    isUploading: false, 
    uploadProgress: 0, 
    currentFileName: "" 
  }),
  resetAll: () => set({
    isUploading: false,
    uploadProgress: 0,
    currentFileName: "",
    finalizationResult: null,
    bookBundle: null,
    uploadedBooks: []
  }),
}));