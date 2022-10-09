import {normalizeEthereumAddress} from './ethereum'
import {normalizeSubstrateAddress} from './substrate'
import {CrossAccountId, EnhancedCrossAccountId} from '../types'
import {is, mirror, normalize, validate} from './index'
import {Address} from "../index";

export const guessAddressAndExtractCrossAccountIdUnsafe = (rawAddress: string | object, normalize: boolean = false): CrossAccountId => {
  const address = rawAddress as any

  if (typeof address === 'object') {
    if (address.hasOwnProperty('Substrate')) {
      validate.substrateAddress(address.Substrate)
      return {Substrate: normalize ? normalizeSubstrateAddress(address.Substrate) : address.Substrate}
    } else if (address.hasOwnProperty('substrate')) {
      validate.substrateAddress(address.substrate)
      return {Substrate: normalize ? normalizeSubstrateAddress(address.substrate) : address.substrate}
    } else if (address.hasOwnProperty('Ethereum')) {
      validate.ethereumAddress(address.Ethereum)
      return {Ethereum: normalize ? normalizeEthereumAddress(address.Ethereum) : address.Ethereum}
    } else if (address.hasOwnProperty('ethereum')) {
      validate.ethereumAddress(address.ethereum)
      return {Ethereum: normalize ? normalizeEthereumAddress(address.ethereum) : address.ethereum}
    } else {
      throw new Error(`Address ${address} is not a valid crossAccountId object (should contain "Substrate"/"substrate" or "Ethereum"/"ethereum" field)`)
    }
  }

  if (typeof address === 'string') {
    if (is.substrateAddress(address)) return {Substrate: normalize ? normalizeSubstrateAddress(address) : address}
    else if (is.ethereumAddress(address)) return {Ethereum: normalize ? normalizeEthereumAddress(address) : address}
    else {
      throw new Error(`Address ${address} is not a valid Substrate or Ethereum address`)
    }
  }

  throw new Error(`Address ${address} is not a string or object: ${typeof address}`)
}

export const guessAddressAndExtractCrossAccountIdSafe = (address: string | object, normalize: boolean = false): CrossAccountId | null => {
  try {
    return guessAddressAndExtractCrossAccountIdUnsafe(address, normalize)
  } catch {
    return null
  }
}

export const substrateOrMirrorIfEthereum = (address: string | object, normalize: boolean = false): string => {
  const addressObject = guessAddressAndExtractCrossAccountIdUnsafe(address, normalize)
  return addressObject.Substrate
    ? addressObject.Substrate
    : mirror.ethereumToSubstrate(addressObject.Ethereum as string)
}

export const addressInAnyFormToEnhancedCrossAccountId = (address: string | object, ss58Prefix: number = 42): EnhancedCrossAccountId => {
  const crossAccountId = Address.extract.crossAccountId(address)

  if (crossAccountId.Ethereum) {
    const normalized = Address.normalize.ethereumAddress(crossAccountId.Ethereum)
    return {
      ...crossAccountId,
      address: normalized,
      addressSS58: normalized,
      isEthereum: true,
      isSubstrate: false,
      type: 'Ethereum',
    }
  } else {
    return {
      ...crossAccountId,
      address: Address.normalize.substrateAddress(crossAccountId.Substrate as string),
      addressSS58: Address.normalize.substrateAddress(crossAccountId.Substrate as string, ss58Prefix),
      isEthereum: false,
      isSubstrate: true,
      type: 'Substrate',
    }
  }
}
