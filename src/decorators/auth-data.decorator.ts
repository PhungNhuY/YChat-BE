import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * get user data from request
 * @param data - optional get one parameter from user object
 */
export const AuthData = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
