import {normalizeEthereumAddress} from './ethereum'
import {normalizeSubstrateAddress, decodeSubstrateAddress} from './substrate'
import {CrossAccountId, EnhancedCrossAccountId} from '../types'
import {is, mirror, validate} from './index'

export const guessAddressAndExtractCrossAccountIdUnsafe = (rawAddress: string | object, normalize: boolean = false): CrossAccountId => {
  const address = rawAddress as any

  if (typeof address === 'object') {
    if (address.hasOwnProperty('eth') && address.hasOwnProperty('sub')) {
      // bn.js value extraction for ethers.js
      const subPublicKey = (address.sub.hasOwnProperty('_hex') && typeof address.sub._hex === 'string')
        ? address.sub._hex
        : address.sub
      if (typeof subPublicKey !== 'string' || !subPublicKey.startsWith('0x')) {
        throw new Error(`Substrate public key must be a hex string, got ${subPublicKey}`)
      }

      const subBigInt = BigInt(subPublicKey)
      const ethBigInt = BigInt(address.eth)

      if (!(Number(subBigInt === 0n) ^ Number(ethBigInt === 0n))) {
        throw new Error(`One of the addresses must be 0, got eth ${address.eth} and substrate public key ${address.sub}.`)
      }

      // always normalize addresses from the EthCrossAccountId
      if (subBigInt === 0n) {
        return {Ethereum: normalizeEthereumAddress(address.eth)}
      } else {
        return {Substrate: normalizeSubstrateAddress(subPublicKey)}
      }
    } else if (address.hasOwnProperty('Substrate') || address.hasOwnProperty('substrate')) {
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
      throw new Error(`Address ${address} is not a valid crossAccountId object (should contain "Substrate"/"substrate" or "Ethereum"/"ethereum" field) or EthCrossAccountId (should contain "eth" and "sub" fields)`)
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
  const crossAccountId = guessAddressAndExtractCrossAccountIdUnsafe(address)

  if (crossAccountId.Ethereum) {
    const normalized = normalizeEthereumAddress(crossAccountId.Ethereum)
    return {
      ...crossAccountId,
      address: normalized,
      addressSS58: normalized,
      substratePublicKey: normalized,
      isEthereum: true,
      isSubstrate: false,
      type: 'Ethereum',
    }
  } else {
    return {
      ...crossAccountId,
      address: normalizeSubstrateAddress(crossAccountId.Substrate as string),
      addressSS58: normalizeSubstrateAddress(crossAccountId.Substrate as string, ss58Prefix),
      substratePublicKey: decodeSubstrateAddress(crossAccountId.Substrate as string).hex,
      isEthereum: false,
      isSubstrate: true,
      type: 'Substrate',
    }
  }
}
