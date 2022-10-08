import {base58, blake2b} from './imports'
import {DecodeSubstrateAddressResult, validate} from './index'
import {normalizeEthereumAddress} from './ethereum'
import {HexString} from '../StringUtils'

const blake2AsU8a = (u8a: Uint8Array, dkLen: 8 | 16 | 32 | 48 | 64 = 32): Uint8Array => {
  return blake2b(u8a, {dkLen})
}

const u8aConcat = (u8as: readonly Uint8Array[]): Uint8Array => {
  let offset = 0

  let length = 0

  for (let i = 0; i < u8as.length; i++) {
    length += u8as[i].length
  }

  const result = new Uint8Array(length)

  for (let i = 0; i < u8as.length; i++) {
    result.set(u8as[i], offset)
    offset += u8as[i].length
  }

  return result
}

// strToU8a('SS58PRE')
const SS58_PREFIX = new Uint8Array([83, 83, 53, 56, 80, 82, 69])

const sshash = (data: Uint8Array): Uint8Array => {
  return blake2AsU8a(u8aConcat([SS58_PREFIX, data]), 64);
}

const checkAddressChecksum = (decoded: Uint8Array, ignoreChecksum: boolean = false): [boolean, number, number, number] => {
  const ss58Length = (decoded[0] & 0b0100_0000) ? 2 : 1;
  const ss58Decoded = ss58Length === 1
    ? decoded[0]
    : ((decoded[0] & 0x3f) << 2) | (decoded[1] >> 6) | ((decoded[1] & 0x3f) << 8);

  // 32/33 bytes public + 2 bytes checksum + prefix
  const isPublicKey = [34 + ss58Length, 35 + ss58Length].includes(decoded.length);
  const length = decoded.length - (isPublicKey ? 2 : 1);

  let isValid = false

  if (!ignoreChecksum) {
    // calculate the hash and do the checksum byte checks
    const hash = sshash(decoded.subarray(0, length));
    isValid = (decoded[0] & 0x80) === 0 && ![46, 47].includes(decoded[0]) && (
      isPublicKey
        ? decoded[decoded.length - 2] === hash[0] && decoded[decoded.length - 1] === hash[1]
        : decoded[decoded.length - 1] === hash[0]
    )
  }

  return [isValid, length, ss58Length, ss58Decoded];
}

export const normalizeSubstrateAddress = (address: string, prefix: number = 42): string => {
  return encodeSubstrateAddress(decodeSubstrateAddress(address).u8a, prefix)
}


export function encodeSubstrateAddress(key: Uint8Array | string | bigint, ss58Format: number = 42): string {
  const u8a: Uint8Array = typeof key === 'string'
    ? HexString.toU8a(key)
    : typeof key === 'bigint'
      ? HexString.toU8a(key.toString(16))
      : key

  if (ss58Format < 0 || ss58Format > 16383 || [46, 47].includes(ss58Format)) {
    throw new Error(`ss58Format is not valid, received ${typeof ss58Format} "${ss58Format}"`)
  }

  const allowedDecodedLengths = [1, 2, 4, 8, 32, 33]
  if (!allowedDecodedLengths.includes(u8a.length)) {
    throw new Error(`key length is not valid, received ${u8a.length}, valid values are ${allowedDecodedLengths.join(', ')}`)
  }

  const u8aPrefix = ss58Format < 64
    ? new Uint8Array([ss58Format])
    : new Uint8Array([
      ((ss58Format & 0xfc) >> 2) | 0x40,
      (ss58Format >> 8) | ((ss58Format & 0x03) << 6)
    ])

  const input = u8aConcat([u8aPrefix, u8a])

  return base58.encode(
    u8aConcat([
      input,
      sshash(input).subarray(0, [32, 33].includes(u8a.length) ? 2 : 1)
    ])
  );
}

export function decodeSubstrateAddress(address: string, ignoreChecksum?: boolean, ss58Format: number = -1): DecodeSubstrateAddressResult {
  let realError: Error | null = null

  try {
    const decoded = base58.decode(address);

    const allowedEncodedLengths = [3, 4, 6, 10, 35, 36, 37, 38]

    if (!allowedEncodedLengths.includes(decoded.length)) {
      realError = new Error(`key length is not valid, decoded key length is ${decoded.length}, valid values are ${allowedEncodedLengths.join(', ')}`)
      throw realError
    }

    const [isValid, endPos, ss58Length, ss58Decoded] = checkAddressChecksum(decoded, ignoreChecksum)

    if (!ignoreChecksum && !isValid) {
      realError = new Error(`Invalid decoded address checksum`)
      throw realError
    }
    if (![-1, ss58Decoded].includes(ss58Format)) {
      realError = new Error(`Expected ss58Format ${ss58Format}, received ${ss58Decoded}`)
      throw realError
    }

    const publicKey = decoded.slice(ss58Length, endPos)

    const hex: string = HexString.fromU8a(publicKey)
    return {
      u8a: publicKey,
      hex,
      bigint: BigInt(hex),
      ss58Prefix: ss58Decoded,
    }
  } catch (error) {
    throw realError
      ? realError
      : new Error(`Decoding ${address}: ${(error as Error).message}`)
  }
}

type SubAddressObj = { Substrate: string }
export const compareSubstrateAddresses = (address1: string | object, address2: string | object): boolean => {
  const addr1 = typeof address1 === 'string'
    ? address1
    : ((address1 as SubAddressObj).Substrate || (address1 as any).substrate) as string | undefined
  const addr2 = typeof address2 === 'string'
    ? address2
    : ((address2 as SubAddressObj).Substrate || (address2 as any).substrate) as string | undefined

  if (!addr1 || !addr2) {
    return false
  }

  try {
    const decoded1 = decodeSubstrateAddress(addr1)
    const decoded2 = decodeSubstrateAddress(addr2)
    return decoded1.bigint === decoded2.bigint
  } catch (e) {
    return false
  }
}

export const addressToEvm = (address: string, ignoreChecksum?: boolean): string => {
  const truncated = decodeSubstrateAddress(address, ignoreChecksum).u8a.subarray(0, 20)
  return normalizeEthereumAddress(HexString.fromU8a(truncated))
}

// strToU8a('evm:')
const EVM_PREFIX_U8A = new Uint8Array([101, 118, 109, 58])
export const evmToAddress = (evmAddress: string, ss58Format: number = 42): string => {
  validate.ethereumAddress(evmAddress)

  const message = u8aConcat([EVM_PREFIX_U8A, HexString.toU8a(evmAddress)])

  return encodeSubstrateAddress(blake2AsU8a(message), ss58Format)
}
