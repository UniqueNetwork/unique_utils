import * as Address from './Address'
import * as constants from './Address/constants'
import * as StringUtils from 'utf-helpers'
import * as CoinUtils from './Utils/coin'

export {
  Address,
  StringUtils,
  constants,
  CoinUtils,
}

export const {
  HexString,
  Utf8,
  Utf16,
} = StringUtils

export const HexUtils = StringUtils.HexString

export {Coin} from './Utils/coin'
export type {ICoin} from './Utils/coin'

export * from './types'
