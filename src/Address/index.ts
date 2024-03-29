import {COLLECTION_ADDRESS_PREFIX, NESTING_PREFIX} from './constants'

import {
  addressToEvm, compareSubstrateAddresses,
  decodeSubstrateAddress, encodeSubstrateAddress,
  evmToAddress,
  normalizeSubstrateAddress
} from './substrate'

import {
  collectionIdAndTokenIdToNestingAddress,
  collectionIdToEthAddress, compareEthereumAddresses, DWORDHexString,
  ethAddressToCollectionId,
  nestingAddressToCollectionIdAndTokenId,
  normalizeEthereumAddress
} from './ethereum'
import {
  CrossAccountId, CrossAccountIdUncapitalized,
  EthAddressObj, EthAddressObjUncapitalized,
  SubAddressObj, SubAddressObjUncapitalized,
  EnhancedCrossAccountId, EthCrossAccountId,
} from '../types'
import {
  addressInAnyFormToEnhancedCrossAccountId,
  guessAddressAndExtractCrossAccountIdSafe,
  guessAddressAndExtractCrossAccountIdUnsafe,
  substrateOrMirrorIfEthereum
} from './crossAccountId'

import * as algorithms from './imports'
import * as constants from './constants'

export {constants, algorithms}

const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/
const SUB_PUBLIC_KEY_REGEX = /^0x[a-fA-F0-9]{64}$/

export type DecodeSubstrateAddressResult = {
  u8a: Uint8Array
  hex: string
  bigint: bigint
  ss58Prefix: number
}

export const validate = {
  substrateAddress: (address: string) => {
    decodeSubstrateAddress(address)
    return true
  },
  ethereumAddress: (address: string) => {
    if (!is.ethereumAddress(address)) {
      throw new Error(`address "${address}" is not valid ethereum address`)
    }
    return true
  },
  substratePublicKey: (address: string) => {
    if (!is.substratePublicKey(address)) {
      throw new Error(`address "${address}" is not valid substrate public key`)
    }
    return true
  },
  collectionAddress: (address: string) => {
    if (!is.collectionAddress(address)) {
      throw new Error(`address ${address} is not a collection address`)
    }
    return true
  },
  nestingAddress: (address: string) => {
    if (!is.nestingAddress(address)) {
      throw new Error(`address ${address} is not a nesting address`)
    }
    return true
  },
  collectionId: (collectionId: number) => {
    if (!is.collectionId(collectionId)) {
      throw new Error(`collectionId should be a number between 0 and 0xffffffff`)
    }
    return true
  },
  tokenId: (tokenId: number) => {
    if (!is.tokenId(tokenId)) {
      throw new Error(`collectionId should be a number between 0 and 0xffffffff`)
    }
    return true
  },
}

export const is = {
  substrateAddress: (address: string): boolean => {
    try {
      decodeSubstrateAddress(address)
      return !is.substratePublicKey(address)
    } catch {
      return false
    }
  },
  ethereumAddress: (address: string): boolean => {
    return typeof address === 'string' && address.length === 42 && !!address.match(ETH_ADDRESS_REGEX)
  },
  substratePublicKey: (address: string): boolean => {
    return typeof address === 'string' && address.length === 66 && !!address.match(SUB_PUBLIC_KEY_REGEX)
  },

  collectionAddress: (address: string): boolean => {
    return is.ethereumAddress(address) && address.toLowerCase().startsWith(COLLECTION_ADDRESS_PREFIX)
  },
  nestingAddress: (address: string): boolean => {
    return is.ethereumAddress(address) && address.toLowerCase().startsWith(NESTING_PREFIX)
  },

  collectionId: (collectionId: number): boolean => {
    return !(typeof collectionId !== 'number' || isNaN(collectionId) || collectionId < 0 || collectionId > 0xffffffff)
  },
  tokenId: (tokenId: number): boolean => {
    return !(typeof tokenId !== 'number' || isNaN(tokenId) || tokenId < 0 || tokenId > 0xffffffff)
  },

  crossAccountId(obj: any): obj is CrossAccountId {
    return is.substrateAddressObject(obj) || is.ethereumAddressObject(obj)
  },
  crossAccountIdUncapitalized(obj: any): obj is CrossAccountIdUncapitalized {
    return is.substrateAddressObjectUncapitalized(obj) || is.ethereumAddressObjectUncapitalized(obj)
  },
  substrateAddressObject(obj: any): obj is SubAddressObj {
    return typeof obj === 'object' && typeof obj?.Substrate === 'string' && is.substrateAddress(obj.Substrate)
  },
  ethereumAddressObject(obj: any): obj is EthAddressObj {
    return typeof obj === 'object' && typeof obj?.Ethereum === 'string' && is.ethereumAddress(obj.Ethereum)
  },
  substrateAddressObjectUncapitalized(obj: any): obj is SubAddressObjUncapitalized {
    return typeof obj === 'object' && typeof obj?.substrate === 'string' && is.substrateAddress(obj.substrate)
  },
  ethereumAddressObjectUncapitalized(obj: any): obj is EthAddressObjUncapitalized {
    return typeof obj === 'object' && typeof obj?.ethereum === 'string' && is.ethereumAddress(obj.ethereum)
  },
  substrateAddressInAnyForm(address: any): address is string | SubAddressObj | SubAddressObjUncapitalized {
    return typeof address === 'string'
      ? is.substrateAddress(address)
      : (
        typeof address === 'object' &&
        !!address &&
        (is.substrateAddressObject(address) || is.substrateAddressObjectUncapitalized(address))
      )
  },
  ethereumAddressInAnyForm(address: any): address is string | EthAddressObj | EthAddressObjUncapitalized {
    return typeof address === 'string'
      ? is.ethereumAddress(address)
      : (
        typeof address === 'object' &&
        !!address &&
        (is.ethereumAddressObject(address) || is.ethereumAddressObjectUncapitalized(address))
      )
  },
  validAddressInAnyForm(address: any): address is string | SubAddressObj | SubAddressObjUncapitalized | EthAddressObj | EthAddressObjUncapitalized {
    return is.ethereumAddressInAnyForm(address) || is.substrateAddressInAnyForm(address)
  }
}

export const collection = {
  idToAddress: collectionIdToEthAddress,
  addressToId: ethAddressToCollectionId,
}
export const nesting = {
  idsToAddress: collectionIdAndTokenIdToNestingAddress,
  addressToIds: nestingAddressToCollectionIdAndTokenId,
}

export const extract = {
  address: (addressOrCrossAccountId: string | object): string => {
    const crossAccountId = guessAddressAndExtractCrossAccountIdUnsafe(addressOrCrossAccountId)
    return (crossAccountId.Substrate || crossAccountId.Ethereum) as string
  },
  addressSafe: (addressOrCrossAccountId: string | object): string | null => {
    const crossAccountId = guessAddressAndExtractCrossAccountIdSafe(addressOrCrossAccountId)
    return crossAccountId ? (crossAccountId.Substrate || crossAccountId.Ethereum) as string : null
  },

  addressNormalized: (addressOrCrossAccountId: string | object): string => {
    const crossAccountId = guessAddressAndExtractCrossAccountIdUnsafe(addressOrCrossAccountId, true)
    return (crossAccountId.Substrate || crossAccountId.Ethereum) as string
  },
  addressNormalizedSafe: (addressOrCrossAccountId: string | object): string | null => {
    const crossAccountId = guessAddressAndExtractCrossAccountIdSafe(addressOrCrossAccountId, true)
    return crossAccountId ? (crossAccountId.Substrate || crossAccountId.Ethereum) as string : null
  },

  addressForScanNormalized: (addressOrCrossAccountId: string | object): string => {
    const crossAccountId = guessAddressAndExtractCrossAccountIdUnsafe(addressOrCrossAccountId, true)
    return (crossAccountId.Substrate || crossAccountId.Ethereum!.toLowerCase()) as string
  },
  addressForScanNormalizedSafe: (addressOrCrossAccountId: string | object): string | null => {
    const crossAccountId = guessAddressAndExtractCrossAccountIdSafe(addressOrCrossAccountId, true)
    return crossAccountId ? (crossAccountId.Substrate || crossAccountId.Ethereum!.toLowerCase()) as string : null
  },


  crossAccountId: (addressOrCrossAccountId: string | object): CrossAccountId => {
    return guessAddressAndExtractCrossAccountIdUnsafe(addressOrCrossAccountId)
  },
  crossAccountIdSafe: (addressOrCrossAccountId: string | object): CrossAccountId | null => {
    return guessAddressAndExtractCrossAccountIdSafe(addressOrCrossAccountId)
  },

  crossAccountIdNormalized: (addressOrCrossAccountId: string | object): CrossAccountId => {
    return guessAddressAndExtractCrossAccountIdUnsafe(addressOrCrossAccountId, true)
  },
  crossAccountIdNormalizedSafe: (addressOrCrossAccountId: string | object): CrossAccountId | null => {
    return guessAddressAndExtractCrossAccountIdSafe(addressOrCrossAccountId, true)
  },

  crossAccountIdUncapitalized: (addressOrCrossAccountId: string | object): CrossAccountIdUncapitalized => {
    const crossAccountId = guessAddressAndExtractCrossAccountIdUnsafe(addressOrCrossAccountId)
    return crossAccountId.Substrate ? {substrate: crossAccountId.Substrate} : {ethereum: crossAccountId.Ethereum!}
  },
  crossAccountIdUncapitalizedSafe: (addressOrCrossAccountId: string | object): CrossAccountIdUncapitalized | null => {
    try {
      return extract.crossAccountIdUncapitalized(addressOrCrossAccountId)
    } catch {
      return null
    }
  },
  crossAccountIdUncapitalizedNormalized: (addressOrCrossAccountId: string | object): CrossAccountIdUncapitalized => {
    const crossAccountId = guessAddressAndExtractCrossAccountIdUnsafe(addressOrCrossAccountId, true)
    return crossAccountId.Substrate ? {substrate: crossAccountId.Substrate} : {ethereum: crossAccountId.Ethereum!}
  },
  crossAccountIdUncapitalizedNormalizedSafe: (addressOrCrossAccountId: string | object): CrossAccountIdUncapitalized | null => {
    try {
      return extract.crossAccountIdUncapitalizedNormalized(addressOrCrossAccountId)
    } catch {
      return null
    }
  },


  substrateOrMirrorIfEthereum: (addressOrCrossAccountId: string | object): string => {
    return substrateOrMirrorIfEthereum(addressOrCrossAccountId)
  },
  substrateOrMirrorIfEthereumSafe: (addressOrCrossAccountId: string | object): string | null => {
    try {
      return substrateOrMirrorIfEthereum(addressOrCrossAccountId)
    } catch {
      return null
    }
  },

  substrateOrMirrorIfEthereumNormalized: (addressOrCrossAccountId: string | object): string => {
    return substrateOrMirrorIfEthereum(addressOrCrossAccountId, true)
  },
  substrateOrMirrorIfEthereumNormalizedSafe: (addressOrCrossAccountId: string | object): string | null => {
    try {
      return substrateOrMirrorIfEthereum(addressOrCrossAccountId, true)
    } catch {
      return null
    }
  },

  substratePublicKey: (addressOrCrossAccountId: string | object): string => {
    const crossAccountId = guessAddressAndExtractCrossAccountIdUnsafe(addressOrCrossAccountId)
    if (!crossAccountId.Substrate) {
      throw new Error('Address is not a substrate address')
    }
    return substrate.decode(crossAccountId.Substrate).hex
  },
  substratePublicKeySafe: (addressOrCrossAccountId: string | object): string | null => {
    try {
      return extract.substratePublicKey(addressOrCrossAccountId)
    } catch {
      return null
    }
  },

  enhancedCrossAccountId: (addressInAnyForm: string | object, ss58Prefix: number = 42): EnhancedCrossAccountId => {
    return addressInAnyFormToEnhancedCrossAccountId(addressInAnyForm, ss58Prefix)
  },
  enhancedCrossAccountIdSafe: (addressInAnyForm: string | object, ss58Prefix: number = 42): EnhancedCrossAccountId | null => {
    try {
      return addressInAnyFormToEnhancedCrossAccountId(addressInAnyForm, ss58Prefix)
    } catch {
      return null
    }
  },

  ethCrossAccountId: (addressInAnyForm: string | object): EthCrossAccountId => {
    const addressEnhanced = addressInAnyFormToEnhancedCrossAccountId(addressInAnyForm)
    if (addressEnhanced.Substrate) {
      return {
        eth: '0x0000000000000000000000000000000000000000',
        sub: addressEnhanced.substratePublicKey,
      }
    } else {
      return {
        eth: addressEnhanced.address,
        sub: '0x00',
      }
    }
  },
  ethCrossAccountIdSafe: (addressInAnyForm: string | object): EthCrossAccountId | null => {
    try {
      return extract.ethCrossAccountId(addressInAnyForm)
    } catch {
      return null
    }
  }
}

export const mirror = {
  substrateToEthereum: addressToEvm,
  ethereumToSubstrate: evmToAddress,
}

export const normalize = {
  substrateAddress: normalizeSubstrateAddress,
  ethereumAddress: normalizeEthereumAddress,
}

export const compare = {
  substrateAddresses: compareSubstrateAddresses,
  ethereumAddresses: compareEthereumAddresses,
}

export const substrate = {
  encode: encodeSubstrateAddress,
  decode: decodeSubstrateAddress,
  compare: compareSubstrateAddresses,
}

export const Address = {
  constants,
  algorithms,
  is,
  validate,
  collection,
  nesting,
  extract,
  mirror,
  normalize,
  compare,
  substrate,
  utils: {
    DWORDHexString,
  }
}
