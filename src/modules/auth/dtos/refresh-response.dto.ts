import { Expose } from 'class-transformer';

export class RefreshResponseDto {
  @Expose()
  access_token: string;

  @Expose()
  access_token_expires_at: number;
}
