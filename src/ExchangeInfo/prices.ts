const URLS = {
  QTZ: {
    mexc: 'https://www.mexc.com/open/api/v2/market/ticker?symbol=QTZ_USDT',
    mexcCorsProxied: 'https://api.allorigins.win/get?url=https%3A%2F%2Fwww.mexc.com%2Fopen%2Fapi%2Fv2%2Fmarket%2Fticker%3Fsymbol%3DQTZ_USDT',
  },
  UNQ: {
    huobi: 'https://api.huobi.pro/market/detail/merged?symbol=unqusdt',
  },
}

const wrapUrlWithCorsProxy = (url: string) => 'https://corsproxy.io/?' + encodeURIComponent(url)

export type IPrice = {
  coin: string
  avg: number
  currency: string
}

export const getQTZPrice = async (dontUseCORSProxy?: boolean): Promise<IPrice> => {
  const url = dontUseCORSProxy ? URLS.QTZ.mexc : URLS.QTZ.mexcCorsProxied
  const response = (await (await fetch(url)).json() as any)

  const result = dontUseCORSProxy
    ? response.data[0]
    : JSON.parse(response.contents).data[0]

  const ask = parseFloat(result.ask)
  const bid = parseFloat(result.ask)
  const avg = parseFloat(((ask + bid) / 2).toFixed(5))
  return {
    coin: 'QTZ',
    avg,
    currency: 'USDT',
  }
}

export const getUNQPrice = async (): Promise<IPrice> => {
  const result = (await (await fetch(URLS.UNQ.huobi)).json() as any).tick
  const ask = result.ask[0]
  const bid = result.bid[0]
  const avg = parseFloat(((ask + bid) / 2).toFixed(5))
  return {
    coin: 'UNQ',
    avg,
    currency: 'USDT',
  }
}
