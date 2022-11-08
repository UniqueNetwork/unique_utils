export type {IPrice} from './prices'
import {getUNQPrice, getQTZPrice} from './prices'

export const ExchangeInfo = {
  getQTZPrice,
  getUNQPrice,
}

export default ExchangeInfo
