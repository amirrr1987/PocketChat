import { userCreateReqSchema, userSchema } from './user.schema';

export const LoginReqSchema = userSchema.omit({
  createdAt: true,
  updatedAt: true,
  id: true,
});

export const RegisterReqSchema = userCreateReqSchema;

  export const ForgotSchema = userSchema.omit({
    createdAt: true,
    updatedAt: true,
    id: true,
  });
