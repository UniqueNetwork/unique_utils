import {Address} from '../Address'

import {IV2Royalty, RoyaltyType, UniqueRoyaltyPart} from './types'
import {splitStringEvery} from './utils'

export const decodeRoyaltyPart = (encoded: string): UniqueRoyaltyPart => {
  if (encoded.length !== 130) {
    throw new Error('Invalid royalty part encoding - length is not 32 bytes ("0x" + 64 symbols)')
  }
  const encodedMeta = encoded.slice(2, 66)
  const encodedAddress = encoded.slice(2 + 64)

  const version = parseInt(encodedMeta.slice(0, 2), 16)
  const decimals = parseInt(encodedMeta.slice(46, 46 + 2), 16)
  const value = BigInt('0x' + encodedMeta.slice(48))
  const royaltyType = encodedMeta[44] === '0'
    ? RoyaltyType.DEFAULT
    : RoyaltyType.PRIMARY_ONLY

  const isEthereum = encodedMeta[45] === '0'
  const address = isEthereum
    ? Address.normalize.ethereumAddress('0x' + encodedAddress.slice(24))
    : Address.substrate.encode(encodedAddress)

  return {
    version,
    decimals,
    value,
    royaltyType,
    address,
  }
}

export const decodeRoyalties = (encoded: string): UniqueRoyaltyPart[] => {
  if (((encoded.length - 2) % 128) !== 0) {
    throw new Error('Invalid royalties encoding - length is not multiple of 64 bytes (128 symbols)')
  }

  const parts = splitStringEvery(encoded.substring(2), 128).map(
    (encoded) => '0x' + encoded,
  )

  return parts.map((part) => decodeRoyaltyPart(part))
}

export const decodeRoyaltyToV2 = (encoded: string): IV2Royalty[] => {
  const royaltyParts = encoded ? decodeRoyalties(encoded) : []

  return royaltyParts.map((royaltyPart) => {
    const royalty: IV2Royalty = {
      address: royaltyPart.address,
      // core idea: given value   2500 with decimals 4, we want to get 2.5
      //                     or 650000 with decimals 6, we want to get 6.5
      percent: Number(royaltyPart.value) / (Math.pow(10, royaltyPart.decimals - 2)),
    }
    if (royaltyPart.royaltyType === RoyaltyType.PRIMARY_ONLY) {
      royalty.isPrimaryOnly = true
    }
    return royalty
  })
}
