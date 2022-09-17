import basex from 'base-x'
import {keccak_256} from '@noble/hashes/sha3'
import {blake2b} from '@noble/hashes/blake2b'

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

const base58 = basex(BASE58_ALPHABET)
const base64 = basex(BASE64_ALPHABET)

export {keccak_256, blake2b, base58, base64, basex}
