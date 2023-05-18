import {LibPart, RoyaltyType, UniqueRoyaltyPart, UniqueRoyaltyPartToEncode} from './types'
import {Address} from '../index'

export const ROYALTIES_PROPERTY = 'royalties'

export const get42Zeros = () => ''.padStart(42, '0')

export const splitStringEvery = (str: string, every: number): string[] => {
  const result = []

  for (let i = 0; i < str.length; i += every) {
    result.push(str.substring(i, i + every))
  }

  return result
}


export const encodeAddress = (address: string): [boolean, string] => {
  if (Address.is.ethereumAddress(address)) {
    return [
      true,
      Address.normalize
        .ethereumAddress(address)
        .substring(2)
        .padStart(64, '0')
        .toLowerCase(),
    ]
  }

  return [false, Address.substrate.decode(address).hex.substring(2)]
}

export const toLibPart = (part: UniqueRoyaltyPart): LibPart => {
  const account = Address.is.ethereumAddress(part.address)
    ? part.address
    : Address.mirror.substrateToEthereum(part.address)

  // recalculating value to 4 decimals
  const value = part.value * 10n ** BigInt(part.decimals - 4)

  return {account, value}
}

export const parseRoyaltyPart = (
  part: UniqueRoyaltyPartToEncode,
): UniqueRoyaltyPart => {
  part.version = part.version ?? 1
  if (1 > part.version || part.version > 127) {
    throw new Error(`Version must be between 1 and 127, got ${part.version}`)
  }

  if (!Number.isInteger(part.version)) {
    throw new Error(`Version must be an integer, got ${part.version}`)
  }

  part.decimals = part.decimals ?? 4
  if (0 > part.decimals || part.decimals > 255) {
    throw new Error(`Decimals must be between 0 and 255, got ${part.decimals}`)
  }

  if (!Number.isInteger(part.decimals)) {
    throw new Error(`Decimals must be an integer, got ${part.decimals}`)
  }

  if (part.value < 1 || part.value > (2n ** 64n - 1n)) {
    throw new Error(
      `Value must be between 1 and 18446744073709551615 (uint64), got ${part.value}`,
    )
  }

  part.royaltyType = part.royaltyType ?? RoyaltyType.DEFAULT

  if (!RoyaltyType[part.royaltyType]) {
    throw new Error(
      `Royalty type must be one of ${Object.keys(RoyaltyType)}, got ${
        part.royaltyType
      }`,
    )
  }

  part.address = Address.extract.address(part.address)

  return part as UniqueRoyaltyPart
}

export const parseRoyalties = (parts: UniqueRoyaltyPartToEncode[]): UniqueRoyaltyPart[] => {
  if (!Array.isArray(parts)) {
    throw new Error('Royalties must be an array')
  }
  return parts.map(parseRoyaltyPart)
}
