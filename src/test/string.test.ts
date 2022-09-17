import {describe, expect, test} from 'vitest'
import {DWORDHexString, Utf8, Utf16, HexString} from '../StringUtils'
import {UtfHelpers} from 'utf-helpers'

describe.concurrent('exports', () => {
  test.concurrent('exports',() => {
    expect({Utf8, Utf16, HexString}).toStrictEqual(UtfHelpers)
  })
})

describe.concurrent('DWORDHexString', () => {
  test.concurrent('fromNumber', () => {
    expect(DWORDHexString.fromNumber(0)).toBe('00000000')
    expect(DWORDHexString.fromNumber(15)).toBe('0000000f')
    expect(DWORDHexString.fromNumber(2 ** 32 - 1)).toBe('ffffffff')

    expect(() => {
      DWORDHexString.fromNumber(-1)
    }).toThrowError('Passed number is less than 0: ')
    expect(() => {
      DWORDHexString.fromNumber(2 ** 32)
    }).toThrowError('Passed number is more than 2**32: ')
  })

  test.concurrent('toNumber', () => {
    expect(DWORDHexString.toNumber('00000000')).toBe(0)
    expect(DWORDHexString.toNumber('0000000f')).toBe(15)
    expect(DWORDHexString.toNumber('ffffffff')).toBe(2 ** 32 - 1)

    expect(() => {
      DWORDHexString.toNumber('')
    }).toThrowError('Passed string is not hexadecimal: ')
    expect(() => {
      DWORDHexString.toNumber('fffffffff')
    }).toThrowError('Passed number is more than 2**32: ')
  })


  test.concurrent('_checkU32', () => {
    expect(DWORDHexString._checkU32(0)).toBe(0)
    expect(DWORDHexString._checkU32(15)).toBe(15)
    expect(DWORDHexString._checkU32(2 ** 32 - 1)).toBe(2 ** 32 - 1)

    expect(() => {
      DWORDHexString._checkU32('' as any as number)
    }).toThrowError('Passed number is not a number: ')
    expect(() => {
      DWORDHexString._checkU32(-1)
    }).toThrowError('Passed number is less than 0: ')
    expect(() => {
      DWORDHexString._checkU32(2 ** 32)
    }).toThrowError('Passed number is more than 2**32: ')
    expect(() => {
      DWORDHexString._checkU32({} as any as number)
    }).toThrowError('Passed number is not a number: ')
    expect(() => {
      DWORDHexString._checkU32([] as any as number)
    }).toThrowError('Passed number is not a number: ')
    expect(() => {
      (DWORDHexString._checkU32 as any)()
    }).toThrowError('Passed number is not a number: ')
  })
})
