import {IV2Royalty, RoyaltyType, UniqueRoyaltyPart, UniqueRoyaltyPartToEncode} from './types'
import {encodeAddress, get42Zeros, parseRoyaltyPart} from './utils'

/**
 * encodes a UniqueRoyaltyPart into a hex string
 * @param part UniqueRoyaltyPart
 * @returns hex string where first 64 characters are metadata in format:
 * VV000000000000000000000000000000000000000000RADDvvvvvvvvvvvvvvvv
 * where:
 * VV - version
 * 42 zeros
 * R - royalty type (0 - default, 1 - primary-only)
 * A - address type (0 - ethereum, 1 - substrate)
 * DD - decimals
 * vvvvvvvvvvvvvvvvvv - value (uint64)
 *
 * and the rest of the string is the address encoded as hex
 */
export const encodeRoyaltyPart = (
  royaltyPart: UniqueRoyaltyPartToEncode,
): string => {
  const part = parseRoyaltyPart(royaltyPart)

  const version = part.version.toString(16).padStart(2, '0')
  const royaltyType = part.royaltyType === RoyaltyType.DEFAULT ? '0' : '1'
  const decimals = part.decimals.toString(16).padStart(2, '0')

  const value = part.value.toString(16).padStart(16, '0')

  const [isEthereum, address] = encodeAddress(part.address)
  const addressType = isEthereum ? '0' : '1'

  return `0x${version}${get42Zeros()}${royaltyType}${addressType}${decimals}${value}${address}`
}

export const encodeRoyalties = (
  parts: UniqueRoyaltyPartToEncode[],
): string =>
  '0x' + parts.map((part) => encodeRoyaltyPart(part).substring(2)).join('')


export const encodeRoyaltyFromV2 = (royalties: IV2Royalty[]) => {
  const royaltiesToEncode = royalties.map((royalty) => {
    const {address, percent, isPrimaryOnly} = royalty;
    return {
      address,
      value: BigInt(Math.round(percent * 100)),
      decimals: 4,
      royaltyType: isPrimaryOnly ? RoyaltyType.PRIMARY_ONLY : RoyaltyType.DEFAULT,
      version: 1,
    } satisfies UniqueRoyaltyPart
  })

  return encodeRoyalties(royaltiesToEncode)
}
