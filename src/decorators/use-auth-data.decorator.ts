import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * get token payload from request
 * @param data - optional get one parameter from payload object
 */
export const UseAuthData = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
