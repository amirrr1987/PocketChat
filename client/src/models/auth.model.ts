import { z } from 'zod'
const AuthSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    username: z.string(),
    email: z.email(),
  }),
})

export type IAuth = z.infer<typeof AuthSchema>
