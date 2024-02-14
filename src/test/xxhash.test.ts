import {describe, test, expect} from 'vitest'

import {Xxhash, encodeSubstrateStorageKey} from 'src/Hashes'

describe('xxhash64', () => {
  test('xxhash64', () => {
    // it just works, or it doesn't
    // it doesn't make sense to write a pile of tests
    const result = encodeSubstrateStorageKey(['System', 'Events'])
    const result_ok = '0x26aa394eea5630e07c48ae0c9558cef780d41e5e16056765bc8461851072c9d7'
    expect(result).toBe(result_ok)

    // to check Xxhash object provides the same function
    expect(Xxhash.encodeSubstrateStorageKey(['abc'])).toBe('0x990977adf52cbc440889329981caa9be')
    expect(Xxhash.xxhashOfU8a).toBeDefined()
  })
})
