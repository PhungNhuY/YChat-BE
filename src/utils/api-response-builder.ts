import { plainToInstance } from 'class-transformer';

export type MultiItemsResponse<T> = { items: T[]; total: number };

export type ApiResponse<T> = {
  success?: boolean;
  data?: T | MultiItemsResponse<T>;
  message?: string;
  error?: any[];
};

export function transformObjectToResponse<T>(data: object, dto: any): T {
  return plainToInstance(dto, data, {
    excludeExtraneousValues: true,
  });
}

export function transformArrayToResponse<T>(
  data: MultiItemsResponse<any>,
  dto: any,
): MultiItemsResponse<T> {
  return {
    items: plainToInstance(dto, data.items, {
      excludeExtraneousValues: true,
    }),
    total: data.total,
  };
}

export function buildSuccessResponse(data?: any): ApiResponse<any> {
  return {
    success: true,
    data,
  };
}

export function buildErrorResponse(
  message: string,
  error?: any[],
): ApiResponse<any> {
  return {
    success: false,
    message,
    error,
  };
}
