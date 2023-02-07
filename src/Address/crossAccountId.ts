import {normalizeEthereumAddress} from './ethereum'
import {normalizeSubstrateAddress} from './substrate'
import {CrossAccountId, EnhancedCrossAccountId} from '../types'
import {is, mirror, normalize, validate} from './index'
import {Address} from "../index";

export const guessAddressAndExtractCrossAccountIdUnsafe = (rawAddress: string | object, normalize: boolean = false): CrossAccountId => {
  const address = rawAddress as any

  if (typeof address === 'object') {
    if (address.hasOwnProperty('Substrate') || address.hasOwnProperty('substrate')) {
      const substrateAddress = address.hasOwnProperty('Substrate') ? address.Substrate : address.substrate
      if (is.substratePublicKey(substrateAddress)) {
        return {Substrate: normalizeSubstrateAddress(substrateAddress)}
      } else if (is.substrateAddress(substrateAddress)) {
        return {Substrate: normalize ? normalizeSubstrateAddress(substrateAddress) : substrateAddress}
      } else {
        throw new Error(`Address ${substrateAddress} is not a valid Substrate address`)
      }
    } else if (address.hasOwnProperty('Ethereum') || address.hasOwnProperty('ethereum')) {
      const ethereumAddress = address.hasOwnProperty('Ethereum') ? address.Ethereum : address.ethereum
      validate.ethereumAddress(ethereumAddress)
      return {Ethereum: normalize ? normalizeEthereumAddress(ethereumAddress) : ethereumAddress}
    } else {
      throw new Error(`Address ${address} is not a valid crossAccountId object (should contain "Substrate"/"substrate" or "Ethereum"/"ethereum" field)`)
    }
  }

  if (typeof address === 'string') {
    if (is.substrateAddress(address)) return {Substrate: normalize ? normalizeSubstrateAddress(address) : address}
    else if (is.ethereumAddress(address)) return {Ethereum: normalize ? normalizeEthereumAddress(address) : address}
    else if (is.substratePublicKey(address)) return {Substrate: normalizeSubstrateAddress(address)}
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
      substratePublicKey: null,
      isEthereum: true,
      isSubstrate: false,
      type: 'Ethereum',
    }
  } else {
    return {
      ...crossAccountId,
      address: Address.normalize.substrateAddress(crossAccountId.Substrate as string),
      addressSS58: Address.normalize.substrateAddress(crossAccountId.Substrate as string, ss58Prefix),
      substratePublicKey: Address.extract.substratePublicKey(crossAccountId.Substrate as string),
      isEthereum: false,
      isSubstrate: true,
      type: 'Substrate',
    }
  }
}
