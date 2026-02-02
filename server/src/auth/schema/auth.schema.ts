import {
  userCreateSchema,
  userSchema,
} from '../../modules/user/schema/user.schema';
export const LoginSchema = userSchema.omit({
  createdAt: true,
  updatedAt: true,
  id: true,
});

export const RegisterSchema = userCreateSchema;

export const ForgotSchema = userSchema.omit({
  createdAt: true,
  updatedAt: true,
  id: true,
});
