import { type PublicUser, publicUserSchema } from '@/contracts/auth'
import type { PasswordChange, ProfileUpdate } from '@/contracts/user'
import { http } from '@/lib/http'
import { parseInDev } from '@/lib/parse'

export const updateProfile = async (body: ProfileUpdate): Promise<PublicUser> => parseInDev(publicUserSchema, await http.patch<PublicUser>('/me', body))

export const uploadAvatar = async (dataUrl: string): Promise<PublicUser> =>
  parseInDev(publicUserSchema, await http.post<PublicUser>('/me/avatar', { dataUrl }))

export const removeAvatar = async (): Promise<PublicUser> => parseInDev(publicUserSchema, await http.delete<PublicUser>('/me/avatar'))

export const changePassword = (body: PasswordChange): Promise<void> => http.post<void>('/me/password', body)
