import { describe, expect, it } from 'vitest'
import { AVATAR_MAX_BYTES, avatarFileError, passwordChangeFrom, savedMessage } from '../account.rules'
import { profileFormSchema } from '../schemas'

const valid = {
  displayName: 'Ana Lima',
  username: 'ana',
  email: 'ana@kurio.test',
  ens: '',
  walletAlias: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

const messagesFor = (input: Record<string, string>) => {
  const result = profileFormSchema.safeParse(input)
  return result.success ? {} : Object.fromEntries(result.error.issues.map((issue) => [issue.path.join('.'), issue.message]))
}

describe('avatarFileError', () => {
  it('aceita PNG, JPEG e WebP até o limite', () => {
    expect(avatarFileError({ type: 'image/png', size: AVATAR_MAX_BYTES })).toBeNull()
    expect(avatarFileError({ type: 'image/webp', size: 10 })).toBeNull()
  })

  it('recusa outro tipo e arquivo grande', () => {
    expect(avatarFileError({ type: 'image/gif', size: 10 })).toBe('Envie uma imagem PNG, JPEG ou WebP.')
    expect(avatarFileError({ type: 'image/jpeg', size: AVATAR_MAX_BYTES + 1 })).toBe('A imagem deve ter até 200 KB.')
  })
})

describe('profileFormSchema', () => {
  it('não exige senha quando a seção está vazia', () => {
    expect(messagesFor(valid)).toEqual({})
  })

  it('valida a troca de senha junto com os erros dos outros campos', () => {
    expect(messagesFor({ ...valid, displayName: 'A', newPassword: 'curta1', confirmPassword: 'outra' })).toEqual({
      displayName: 'Mínimo de 2 caracteres',
      currentPassword: 'Informe a senha atual',
      newPassword: 'Mínimo de 8 caracteres',
      confirmPassword: 'As senhas não conferem',
    })
  })

  it('aceita ENS vazio ou terminado em .eth', () => {
    expect(messagesFor({ ...valid, ens: 'ana.kurio.eth' })).toEqual({})
    expect(messagesFor({ ...valid, ens: 'ana.kurio' })).toEqual({ ens: 'Use um nome terminado em .eth' })
  })
})

describe('passwordChangeFrom e savedMessage', () => {
  it('só monta a troca quando há senha preenchida', () => {
    expect(passwordChangeFrom(valid)).toBeNull()
    expect(passwordChangeFrom({ ...valid, currentPassword: 'Kurio!2026', newPassword: 'NovaSenha2026' })).toEqual({
      currentPassword: 'Kurio!2026',
      newPassword: 'NovaSenha2026',
    })
  })

  it('descreve o que foi salvo', () => {
    expect(savedMessage(true, true)).toBe('Perfil e senha atualizados.')
    expect(savedMessage(true, false)).toBe('Perfil atualizado.')
    expect(savedMessage(false, true)).toBe('Senha alterada.')
  })
})
