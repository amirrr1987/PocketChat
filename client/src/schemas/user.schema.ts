import { z } from 'zod';
export const userSchema = z.object({
  id: z.uuid(),
  username: z.string().min(3),
  password: z.string().min(8),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const userCreateReqSchema = userSchema.omit({
  createdAt: true,
  updatedAt: true,
  id: true,
});
export const userCreateResSchema = userSchema.omit({
  createdAt: true,
  updatedAt: true,
  id: true,
});


  export const userFindAllReqSchema = userSchema.omit({
  createdAt: true,
  updatedAt: true,
  id: true,
});
export const userFindAllResSchema = userSchema.omit({
  createdAt: true,
  updatedAt: true,
  id: true,
});

export const userFindOneReqSchema = userSchema.omit({
  createdAt: true,
  updatedAt: true,
  id: true,
});
export const userFindOneResSchema = userSchema.omit({
  createdAt: true,
  updatedAt: true,
  id: true,
});

export const userUpdateReqSchema = userSchema.omit({
  createdAt: true,
  updatedAt: true,
  id: true,
});
export const userUpdateResSchema = userSchema.omit({
  createdAt: true,
  updatedAt: true,
  id: true,
});

export const userRemoveReqSchema = userSchema.omit({
  createdAt: true,
  updatedAt: true,
  id: true,
});
export const userRemoveResSchema = userSchema.omit({
  createdAt: true,
  updatedAt: true,
  id: true,
});