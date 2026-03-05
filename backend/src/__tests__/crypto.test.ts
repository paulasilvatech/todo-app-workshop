import { encrypt, decrypt } from '../lib/crypto'

describe('crypto', () => {
  it('encrypt then decrypt returns the original plaintext', () => {
    const original = 'gho_supersecrettoken123'
    const ciphertext = encrypt(original)
    const decrypted = decrypt(ciphertext)
    expect(decrypted).toBe(original)
  })

  it('produces different ciphertexts for the same input (due to random IV)', () => {
    const plain = 'same_input_value'
    const c1 = encrypt(plain)
    const c2 = encrypt(plain)
    expect(c1).not.toBe(c2)
    // But both decrypt to the same value
    expect(decrypt(c1)).toBe(plain)
    expect(decrypt(c2)).toBe(plain)
  })

  it('different plaintexts produce different ciphertexts', () => {
    const c1 = encrypt('token_a')
    const c2 = encrypt('token_b')
    expect(c1).not.toBe(c2)
  })

  it('throws on tampered ciphertext', () => {
    const ciphertext = encrypt('real_token')
    const tampered = ciphertext.slice(0, -4) + 'XXXX'
    expect(() => decrypt(tampered)).toThrow()
  })

  it('throws on invalid format', () => {
    expect(() => decrypt('notavalidformat')).toThrow('Invalid encrypted token format')
  })
})
