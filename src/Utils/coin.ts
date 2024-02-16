export const DEFAULT_DECIMALS = 18

const validateDecimals = (decimals: any): decimals is number => {
  if (typeof decimals !== 'number') throw new Error('Invalid decimals, must be a number')
  if (decimals < 1 || decimals > 18) throw new Error('Invalid decimals, must be between 0 and 18')
  return true
}

export const coinsToWeiInBigInt = (value: string, decimals: number = DEFAULT_DECIMALS): bigint => {
  //test that value is string of positive number
  if (!/^\d+(\.\d+)?$/.test(value)) {
    throw new Error('Invalid value')
  }
  validateDecimals(decimals)

  // Define the multiplier as a BigInt
  const multiplier = 10n ** BigInt(decimals)

  // Convert the integer part and fractional part separately
  let [integerPart, fractionalPart = ''] = value.split('.')

  // Ensure the fractional part is not longer than decimals digits
  fractionalPart = fractionalPart.padEnd(decimals, '0').slice(0, decimals)

  // Combine the integer and fractional parts
  const weiValue = BigInt(integerPart) * multiplier + BigInt(fractionalPart)

  return weiValue
}

export const coinsToWei = (value: string, decimals: number = DEFAULT_DECIMALS): string => {
  return coinsToWeiInBigInt(value, decimals).toString()
}

export const weiToCoins = (weiValue: string | bigint, decimals: number = DEFAULT_DECIMALS): string => {
  validateDecimals(decimals)

  const weiBigInt = BigInt(weiValue)
  const divisor = 10n ** BigInt(decimals)

  // Divide the Wei amount by the divisor to get the Ether amount
  const ethAmountBigInt = weiBigInt / divisor
  const remainder = weiBigInt % divisor

  // Convert the remainder to a string with leading zeros
  let remainderStr = remainder.toString().padStart(decimals, '0')

  // Remove trailing zeros from the remainder
  remainderStr = remainderStr.replace(/0+$/, '')

  // Combine the integer part and the fractional part
  const ethAmount = `${ethAmountBigInt}${remainderStr.length > 0 ? '.' + remainderStr : ''}`

  return ethAmount
}

export const dangerouslyWeiToCoinsInFloat = (weiValue: string | bigint, decimals: number = DEFAULT_DECIMALS): number =>
  parseFloat(weiToCoins(weiValue, decimals))

export const formatMetric = (numberStr: string, currency?: string): string => {
  const num = parseFloat(numberStr)
  if (isNaN(num)) return numberStr // Return original string if not a valid number

  const suffixes = ["", "K", "M", "B", "T"]
  const i = num === 0 ? 0 : Math.floor(Math.log(num) / 6.907755278982137) // 6.907... is Math.log(1000)
  const withPossibleTrailingZeroes = (num / Math.pow(1000, i)).toFixed(3)

  // remove trailing zeroes
  const formatted = withPossibleTrailingZeroes.replace(/\.?0+$/, '')

  return `${formatted}${suffixes[i]}${currency ? ` ${currency}` : ''}`
}

export const weiToCoinsMetric = (weiValue: string | bigint, currency?: string, decimals: number = DEFAULT_DECIMALS): string => {
  return formatMetric(weiToCoins(weiValue, decimals), currency)
}

export const Coin = (currency: string, decimals: number = DEFAULT_DECIMALS) => {
  if (typeof currency as any !== 'string') throw new Error('Invalid currency, must be a string')
  validateDecimals(decimals)

  return {
    coinsToWeiInBigInt: (value: string): bigint => coinsToWeiInBigInt(value, decimals),
    coinsToWei: (value: string): string => coinsToWei(value, decimals),
    weiToCoins: (value: string | bigint): string => weiToCoins(value, decimals),

    dangerouslyWeiToCoinsInFloat: (value: string | bigint): number => dangerouslyWeiToCoinsInFloat(value, decimals),

    formatMetric: (value: string): string => formatMetric(value, currency),
    weiToCoinsMetric: (value: string | bigint): string => weiToCoinsMetric(value, currency, decimals),
  }
}

export type ICoin = ReturnType<typeof Coin>
