import {normalizeEthereumAddress} from './ethereum'
import {normalizeSubstrateAddress} from './substrate'
import {CrossAccountId} from '../types'
import {is, mirror, normalize} from './index'

export const guessAddressAndExtractItNormalizedSafe = (address: string | object): string | null => {
  if (typeof address === 'object') {
    if (is.substrateAddressObject(address)) return normalize.substrateAddress(address.Substrate)
    else if (is.substrateAddressObjectUncapitalized(address)) return normalize.substrateAddress(address.substrate)
    else if (is.ethereumAddressObject(address)) return normalizeEthereumAddress(address.Ethereum)
    else if (is.ethereumAddressObjectUncapitalized(address)) return normalizeEthereumAddress(address.ethereum)
    else return null
  }
  if (typeof address === 'string') {
    if (is.substrateAddress(address)) return normalizeSubstrateAddress(address)
    else if (is.ethereumAddress(address)) return normalizeEthereumAddress(address)
    else return null
  }

  return null
}

export const guessAddressAndExtractItNormalized = (address: string | object): string => {
  const result = guessAddressAndExtractItNormalizedSafe(address)
  if (!result) {
    throw new Error(`Passed address is not a valid address string or object: ${JSON.stringify(address).slice(0, 100)}`)
  }
  return result
}

export const addressToCrossAccountId = (address: string): CrossAccountId => {
  if (is.substrateAddress(address)) {
    return {Substrate: address}
  } else if (is.ethereumAddress(address)) {
    return {Ethereum: address}
  }

  throw new Error(`Passed address ${address} is not substrate nor ethereum address`)
}

export const addressToCrossAccountIdNormalized = (address: string): CrossAccountId => {
  if (is.substrateAddress(address)) {
    return {Substrate: normalize.substrateAddress(address)}
  } else if (is.ethereumAddress(address)) {
    return {Ethereum: normalize.ethereumAddress(address)}
  }

  throw new Error(`Passed address ${address} is not substrate nor ethereum address`)
}

export const substrateNormalizedWithMirrorIfEthereum = (address: string): string => {
  const addressObject = addressToCrossAccountId(address)
  return addressObject.Substrate
    ? normalizeSubstrateAddress(addressObject.Substrate)
    : mirror.ethereumToSubstrate(addressObject.Ethereum as string)
}
