export type MultiItemsResponse<T> = { items: T[]; total: number };

export type ApiResponse<T> = {
  success?: boolean;
  data?: T | MultiItemsResponse<T>;
  message?: string;
  error?: any[];
};
