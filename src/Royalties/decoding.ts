import {Address} from '../Address'

import {RoyaltyType, UniqueRoyaltyPart} from './types'
import {splitStringEvery} from './utils'

export const decodeRoyaltyPart = (encoded: string): UniqueRoyaltyPart => {
  const encodedMeta = encoded.slice(2, 66)
  const encodedAddress = encoded.slice(2 + 64)

  const version = parseInt(encodedMeta.slice(0, 2), 16)
  const decimals = parseInt(encodedMeta.slice(46, 46 + 2), 16)
  const value = BigInt('0x' + encodedMeta.slice(48))
  const royaltyType =
    encodedMeta[44] === '0' ? RoyaltyType.DEFAULT : RoyaltyType.PRIMARY_ONLY

  const isEthereum = encodedMeta[45] === '0'
  const address = isEthereum
    ? '0x' + encodedAddress.slice(24)
    : Address.substrate.encode(encodedAddress)

  return {
    version,
    decimals,
    value,
    royaltyType,
    address,
  }
}

export const decodeRoyalty = (encoded: string): UniqueRoyaltyPart[] => {
  const parts = splitStringEvery(encoded.substring(2), 128).map(
    (encoded) => '0x' + encoded,
  )

  return parts.map((part) => decodeRoyaltyPart(part))
}
