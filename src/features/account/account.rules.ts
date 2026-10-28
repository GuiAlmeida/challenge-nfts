import type { PublicUser } from '@/contracts/auth'
import type { PasswordChange, ProfileUpdate } from '@/contracts/user'
import type { ProfileFormOutput, ProfileFormValues } from './schemas'

export const AVATAR_MAX_BYTES = 200 * 1024
const AVATAR_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])

export const PROFILE_FIELDS = ['displayName', 'username', 'email', 'ens', 'walletAlias'] as const

export function avatarFileError(file: { type: string; size: number }): string | null {
  if (!AVATAR_TYPES.has(file.type)) return 'Envie uma imagem PNG, JPEG ou WebP.'
  if (file.size > AVATAR_MAX_BYTES) return 'A imagem deve ter até 200 KB.'
  return null
}

export function profileFormFrom(user: PublicUser): ProfileFormValues {
  return {
    displayName: user.displayName,
    username: user.username,
    email: user.email,
    ens: user.ens ?? '',
    walletAlias: user.walletAlias ?? '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  }
}

export function profilePatch(values: ProfileFormOutput): ProfileUpdate {
  return {
    displayName: values.displayName,
    username: values.username,
    email: values.email,
    ens: values.ens,
    walletAlias: values.walletAlias,
  }
}

export function passwordChangeFrom(values: ProfileFormOutput): PasswordChange | null {
  if (!values.currentPassword && !values.newPassword) return null
  return { currentPassword: values.currentPassword, newPassword: values.newPassword }
}

export function savedMessage(profile: boolean, password: boolean): string {
  if (profile && password) return 'Perfil e senha atualizados.'
  return profile ? 'Perfil atualizado.' : 'Senha alterada.'
}
