import {HexString, DWORDHexString} from '../StringUtils'

import {keccak_256} from "./imports"
import {COLLECTION_ADDRESS_PREFIX, NESTING_PREFIX} from "./constants"
import {is, validate} from "./index"

const unsafeNormalizeEthereumAddress = (address: string) => {
  const addr = address.toLowerCase().replace(/^0x/i, '')
  const addressHash = HexString.fromU8a(keccak_256(addr)).replace(/^0x/i, '')

  let checksumAddress = '0x'

  for (let i = 0; i < addr.length; i++) {
    checksumAddress += (parseInt(addressHash[i], 16) > 7)
      ? addr[i].toUpperCase()
      : addr[i]
  }

  return checksumAddress
}
export const normalizeEthereumAddress = (address: string) => {
  validate.ethereumAddress(address)
  return unsafeNormalizeEthereumAddress(address)
}

type EthAddressObj = { Ethereum: string }
export const compareEthereumAddresses = (address1: string | EthAddressObj | object, address2: string | EthAddressObj | object): boolean => {
  const addr1 = typeof address1 === 'string'
    ? address1
    : ((address1 as EthAddressObj).Ethereum || (address1 as any).ethereum) as string | undefined
  const addr2 = typeof address2 === 'string'
    ? address2
    : ((address2 as EthAddressObj).Ethereum || (address2 as any).ethereum) as string | undefined

  if (!addr1 || !addr2 || !is.ethereumAddress(addr1) || !is.ethereumAddress(addr2)) {
    return false
  }
  return addr1.toLowerCase() === addr2.toLowerCase()

}

export const collectionIdToEthAddress = (collectionId: number): string | null => {
  validate.collectionId(collectionId)
  return unsafeNormalizeEthereumAddress(
    COLLECTION_ADDRESS_PREFIX +
    DWORDHexString.fromNumber(collectionId)
  )
}
export const ethAddressToCollectionId = (address: string): number | null => {
  validate.collectionAddress(address)
  return DWORDHexString.toNumber(address.slice(-8))
}

export const collectionIdAndTokenIdToNestingAddress = (collectionId: number, tokenId: number): string => {
  validate.collectionId(collectionId)
  validate.tokenId(tokenId)

  return unsafeNormalizeEthereumAddress(
    NESTING_PREFIX +
    DWORDHexString.fromNumber(collectionId) +
    DWORDHexString.fromNumber(tokenId)
  )
}

export const nestingAddressToCollectionIdAndTokenId = (address: string): { collectionId: number, tokenId: number } => {
  validate.nestingAddress(address)
  return {
    collectionId: DWORDHexString.toNumber(address.slice(-16, -8)),
    tokenId: DWORDHexString.toNumber(address.slice(-8)),
  }
}
