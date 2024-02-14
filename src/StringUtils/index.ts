import {Utf8, Utf16, HexString} from 'utf-helpers'
export {Utf8, Utf16, HexString}
export const HexUtils = HexString

export const DWORDHexString = {
  _checkU32: (num: number): number => {
    if (typeof num !== 'number') throw new Error(`Passed number is not a number: ${typeof num}, ${num}`)
    if (isNaN(num)) throw new Error(`Passed number is NaN: ${num}`)
    if (num < 0) throw new Error(`Passed number is less than 0: ${num}`)
    if (num > 0xFFFFFFFF) throw new Error(`Passed number is more than 2**32: ${num}`)
    if (num !== Math.floor(num)) throw new Error(`Passed number is not an integer number: ${num}`)

    return num
  },
  fromNumber: (n: number): string => {
    return DWORDHexString._checkU32(n).toString(16).padStart(8, '0')
  },
  toNumber: (s: string): number => {
    const num: number = parseInt(s, 16)

    if (isNaN(num)) throw new Error(`Passed string is not hexadecimal: ${s}`)

    return DWORDHexString._checkU32(num)
  }
}
