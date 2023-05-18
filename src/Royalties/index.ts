import {UniqueRoyaltyPart, UniqueRoyaltyPartToEncode} from './types'

export * from './types'

import * as calculation from './calculation'
import * as decoding from './decoding'
import * as encoding from './encoding'
import * as utils from './utils'
import {parseRoyalties, parseRoyaltyPart} from './utils'

export const Royalties = {
  part: {
    calculate: calculation.calculateRoyaltyPart,
    decode: decoding.decodeRoyaltyPart,
    encode: encoding.encodeRoyaltyPart,
    validate: (part: UniqueRoyaltyPartToEncode): part is UniqueRoyaltyPart => {
      parseRoyaltyPart(part)
      return true
    },
  },
  calculate: calculation.calculateRoyalties,
  decode: decoding.decodeRoyalty,
  encode: encoding.encodeRoyalties,
  validate: (royalties: UniqueRoyaltyPartToEncode[]): royalties is UniqueRoyaltyPart[] => {
    parseRoyalties(royalties)
    return true
  },
  utils,
}
