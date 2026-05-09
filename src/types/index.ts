// Central TypeScript type definitions for the cleargroup app

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}
