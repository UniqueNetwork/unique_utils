import {documentReadyPromiseAndWindowIsOk} from './utils'

export const windowIsOkSync = (): boolean => {
  return typeof window !== 'undefined' && !!(window as any).ethereum;
}

export interface AddEthereumChainParameter {
  chainId: string // A 0x-prefixed hexadecimal string
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string // 2-6 characters long
    decimals: 18
  }
  rpcUrls: string[]
  blockExplorerUrls?: string[]
  iconUrls?: string[] // Currently ignored
}

export type UNIQUE_CHAIN = 'unique' | 'quartz' | 'opal' | 'sapphire'
const UNIQUE_CHAINS: UNIQUE_CHAIN[] = ['unique', 'quartz', 'opal', 'sapphire']
const UNIQUE_CHAIN_IDS: number[] = [8880, 8881, 8882, 8883]

const UniqueChainName: Record<UNIQUE_CHAIN, UNIQUE_CHAIN> = {
  unique: 'unique',
  quartz: 'quartz',
  opal: 'opal',
  sapphire: 'sapphire',
}
const chainNameToChainId: Record<UNIQUE_CHAIN, number> = {
  unique: 8880,
  quartz: 8881,
  opal: 8882,
  sapphire: 8883
}
const chainIdToChainName: Record<number, UNIQUE_CHAIN> = {
  8880: 'unique',
  8881: 'quartz',
  8882: 'opal',
  8883: 'sapphire'
}

const isUniqueChainFactory = (chainName: UNIQUE_CHAIN) => (): boolean => {
  if (!windowIsOkSync()) {
    return false
  }
  const chainId = parseInt((window as any).ethereum.chainId, 16)
  return chainId === chainNameToChainId[chainName]
}
const currentChainIs: Record<UNIQUE_CHAIN, () => boolean> & {
  anyUniqueChain: (chainId: string | number) => boolean
  byName: (chainName: string) => boolean
} = {
  unique: isUniqueChainFactory('unique'),
  quartz: isUniqueChainFactory('quartz'),
  opal: isUniqueChainFactory('opal'),
  sapphire: isUniqueChainFactory('sapphire'),
  byName: (chainName: string) => {
    if (!UNIQUE_CHAINS.includes(chainName as UNIQUE_CHAIN)) {
      throw new Error(`Invalid chain name: ${chainName}`)
    }
    return isUniqueChainFactory(chainName as UNIQUE_CHAIN)()
  },
  anyUniqueChain: (chainId: string | number | null | undefined): boolean => {
    if (!chainId) return false

    // check if chain id is in the list of unique chains in string or number format
    return (
      (typeof chainId === 'string' && UNIQUE_CHAINS.includes(chainId as UNIQUE_CHAIN)) ||
      (typeof chainId === 'number' && UNIQUE_CHAIN_IDS.includes(chainId))
    )
  }
}


export type IEthereumExtensionResult = {
  address: string
  chainId: number
}

export type IEthereumExtensionError = Error & {
  extensionNotFound: boolean
  userRejected: boolean
  needToRequestAccess: boolean
  chainId: number | null
}

/**
 * @param requestInsteadOfGet - if true, will call eth_requestAccounts instead of eth_accounts
 * @returns {Promise<IEthereumExtensionResult>}
 * @throws {IEthereumExtensionError}
 */
const getOrRequestAccounts = async (requestInsteadOfGet: boolean = false): Promise<IEthereumExtensionResult> => {
  const windowIsOk = await documentReadyPromiseAndWindowIsOk()

  if (!windowIsOk) {
    // silently return empty result in non browser environment (e.g. nodejs)
    // to not bother if someone is using this lib in nodejs
    return {address: '', chainId: 0}
  }

  if (!(window as any).ethereum) {
    const error = new Error('No extension found') as IEthereumExtensionError
    error.extensionNotFound = true
    error.userRejected = false
    error.needToRequestAccess = false
    error.chainId = null

    throw error
  }

  const ethereum = (window as any).ethereum
  let accounts: string[] = []
  let chainId: number | null = null
  try {
    accounts = await ethereum.request({method: requestInsteadOfGet ? 'eth_requestAccounts' : 'eth_accounts'})
    chainId = parseInt(ethereum.chainId, 16)
  } catch (_error: any) {
    // EIP-1193 userRejectedRequest error code is 4001
    // If this happens, the user rejected the connection request.

    const error = _error as IEthereumExtensionError
    error.userRejected = _error.code === 4001
    error.extensionNotFound = false
    error.needToRequestAccess = false

    const chainIdStr = (window as any).ethereum?.chainId
    error.chainId = typeof chainIdStr === 'string' ? parseInt(chainIdStr, 16) : NaN

    throw error
  }

  const account = accounts[0]
  if (!account) {
    const error = new Error('Need to request account') as IEthereumExtensionError
    error.extensionNotFound = false
    error.userRejected = false
    error.needToRequestAccess = true
    error.chainId = chainId

    throw error
  }
  return {
    address: accounts[0],
    chainId,
  }
}

export type IEthereumExtensionResultSafe = {
  result: IEthereumExtensionResult
  error: null
} | {
  result: null
  error: IEthereumExtensionError
}

const getOrRequestAccountsSafe = async (requestInsteadOfGet: boolean = false): Promise<IEthereumExtensionResultSafe> => {
  try {
    return {result: await getOrRequestAccounts(requestInsteadOfGet), error: null}
  } catch (error: any) {
    return {result: null, error}
  }
}

export const addChainToExtension = async (chainData: AddEthereumChainParameter): Promise<void> => {
  const windowIsOk = await documentReadyPromiseAndWindowIsOk()
  if (!windowIsOk) return

  const ethereum = (window as any).ethereum

  if (ethereum.chainId === chainData.chainId) {
    console.log(`No need to add the chain to wallet - wallet already has ${chainData.chainName}'s chainId: ${ethereum.chainId} (${parseInt(ethereum.chainId)})`)
    return
  }

  try {
    await ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [chainData],
    })
  } catch (error: any) {
    console.error('Error during attempt to add chain to wallet', error.code, error)
    throw error
  }
}


const UNIQUE_CHAINS_DATA_FOR_EXTENSIONS: Record<UNIQUE_CHAIN, AddEthereumChainParameter> = {
  unique: {
    chainId: '0x22b0',
    chainName: 'Unique',
    nativeCurrency: {
      name: 'Unique',
      symbol: 'UNQ',
      decimals: 18,
    },
    rpcUrls: [`https://rpc.unique.network`],
    iconUrls: [`https://ipfs.unique.network/ipfs/QmbJ7CGZ2GxWMp7s6jy71UGzRsMe4w3KANKXDAExYWdaFR`],
    blockExplorerUrls: ['https://uniquescan.io/unique/'],
  },
  quartz: {
    chainId: '0x22b1',
    chainName: 'Quartz by Unique',
    nativeCurrency: {
      name: 'Quartz',
      symbol: 'QTZ',
      decimals: 18,
    },
    rpcUrls: [`https://rpc-quartz.unique.network`],
    iconUrls: [`https://ipfs.unique.network/ipfs/QmaGPdccULQEFcCGxzstnmE8THfac2kSiGwvWRAiaRq4dp`],
    blockExplorerUrls: ['https://uniquescan.io/quartz/'],
  },
  opal: {
    chainId: '0x22b2',
    chainName: 'Opal by Unique',
    nativeCurrency: {
      name: 'Opal',
      symbol: 'OPL',
      decimals: 18,
    },
    rpcUrls: [`https://rpc-opal.unique.network`],
    iconUrls: [`https://ipfs.unique.network/ipfs/QmYJDpmWyjDa3H6BxweFmQXk4fU8b1GU7M9EqYcaUNvXzc`],
    blockExplorerUrls: ['https://uniquescan.io/opal/'],
  },
  sapphire: {
    chainId: '0x22b3',
    chainName: 'Sapphire by Unique',
    nativeCurrency: {
      name: 'Quartz',
      symbol: 'QTZ',
      decimals: 18,
    },
    rpcUrls: [`https://rpc-sapphire.unique.network`],
    iconUrls: [`https://ipfs.unique.network/ipfs/Qmd1PGt4cDRjFbh4ihP5QKEd4XQVwN1MkebYKdF56V74pf`],
    blockExplorerUrls: ['https://uniquescan.io/sapphire/'],
  },
}

const addChain: Record<UNIQUE_CHAIN, () => Promise<void>> & {
  anyChain: (chainData: AddEthereumChainParameter) => Promise<void>
  byName: (chainName: string) => Promise<void>
} = {
  unique: () => addChainToExtension(UNIQUE_CHAINS_DATA_FOR_EXTENSIONS.unique),
  quartz: () => addChainToExtension(UNIQUE_CHAINS_DATA_FOR_EXTENSIONS.quartz),
  opal: () => addChainToExtension(UNIQUE_CHAINS_DATA_FOR_EXTENSIONS.opal),
  sapphire: () => addChainToExtension(UNIQUE_CHAINS_DATA_FOR_EXTENSIONS.sapphire),
  anyChain: (chainData: AddEthereumChainParameter) => addChainToExtension(chainData),
  byName: (chainName: string) => {
    if (!UNIQUE_CHAINS.includes(chainName as UNIQUE_CHAIN)) {
      throw new Error(`Invalid chain name: ${chainName}`)
    }
    return addChainToExtension(UNIQUE_CHAINS_DATA_FOR_EXTENSIONS[chainName as UNIQUE_CHAIN])
  },
}

const switchToChain = async (chainId: number | string): Promise<void> => {
  const windowIsOk = await documentReadyPromiseAndWindowIsOk()
  if (!windowIsOk) return

  const parsedChainId: string = typeof chainId === 'string' ? chainId : '0x' + chainId.toString(16)

  await (window as any).ethereum.request({method: 'wallet_switchEthereumChain', params: [{chainId: parsedChainId}]})
}
const switchChainTo: Record<UNIQUE_CHAIN, () => Promise<void>> & {
  anyChain: (chainId: number | string) => Promise<void>
  byName: (chainName: string) => Promise<void>
} = {
  unique: () => switchToChain(chainNameToChainId.unique),
  quartz: () => switchToChain(chainNameToChainId.quartz),
  opal: () => switchToChain(chainNameToChainId.opal),
  sapphire: () => switchToChain(chainNameToChainId.sapphire),
  anyChain: (chainId) => switchToChain(chainId),
  byName: (chainName) => {
    if (!UNIQUE_CHAINS.includes(chainName as UNIQUE_CHAIN)) {
      throw new Error(`Invalid chain name: ${chainName}`)
    }
    return switchToChain(chainNameToChainId[chainName as UNIQUE_CHAIN])
  },
}

export type UpdateReason = 'account' | 'chain'

const subscribeOnChanges = (cb: (result: { reason: UpdateReason, chainId: number, address: string }) => void): (() => void) => {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    return () => undefined
  }

  const ethereum = (window as any).ethereum

  const refresh = (reason: UpdateReason) => {
    if (ethereum.chainId && ethereum.selectedAddress) {
      cb({reason, address: ethereum.selectedAddress, chainId: parseInt(ethereum.chainId, 16)})
    } else {
      getAccounts().then(({chainId, address}) => {
        cb({reason, chainId, address})
      }).catch((e) => console.error(`Error during attempt to update account info in subscribeOnChanges`, e))
    }
  }

  ethereum.on('accountsChanged', () => {
    refresh('account')
  })
  ethereum.on('chainChanged', () => {
    refresh('chain')
  })
  return () => {
    ethereum.removeListener('accountsChanged', refresh)
    ethereum.removeListener('networkChanged', refresh)
  }
}

import type {ContractReceipt, Event} from 'ethers'

const parseEthersTxReceipt = <ParsedEvents = any>(tx: ContractReceipt, options = {decimals: 18}) => {
  const events = (tx.events || []).filter(event => !!event.event).map((event: Event, index) => {
    const args = event.args
    return {
      name: event.event || `event_${index.toString().padStart(4, '0')}`,
      // args: event.args!,
      events: !args ? {} : Object.keys(args)
        .filter(key => isNaN(parseInt(key)))
        .reduce((acc, key) => {
          const rawValue = args[key]
          const value = (typeof rawValue === 'object' && rawValue?._isBigNumber)
            ? rawValue.toBigInt()
            : rawValue
          acc[key] = value
          return acc
        }, {} as { [K: string]: any })
    }
  }).reduce((acc, elem) => {
    acc[elem.name] = elem.events
    return acc
  }, {} as { [K: string]: any }) as ParsedEvents

  const rawPrice = tx.gasUsed.toBigInt() * tx.effectiveGasPrice.toBigInt()
  const priceStr = rawPrice.toString().padStart(options.decimals + 1, '0')
  const price = parseFloat([priceStr.slice(0, -options.decimals), '.', priceStr.slice(-options.decimals)].join(''))

  return {
    get tx() {
      return tx
    },
    from: tx.from,
    to: tx.to,
    rawPrice,
    price,
    rawEvents: tx.events || [],
    events,
    gasUsed: tx.gasUsed.toBigInt(),
    cumulativeGasUsed: tx.cumulativeGasUsed.toBigInt(),
    effectiveGasPrice: tx.effectiveGasPrice.toBigInt(),
  }
}

/**
 * @returns {Promise<IEthereumExtensionResult>}
 * @throws {IEthereumExtensionError}
 */
const requestAccounts = () => getOrRequestAccounts(true)

/**
 * @returns {Promise<IEthereumExtensionResult>}
 * @throws {IEthereumExtensionError}
 */
const getAccounts = () => getOrRequestAccounts()

export const Ethereum = {
  getOrRequestAccounts,
  getOrRequestAccountsSafe,

  requestAccounts,
  getAccounts,

  requestAccountsSafe: () => getOrRequestAccountsSafe(true),
  getAccountsSafe: () => getOrRequestAccountsSafe(),

  subscribeOnChanges,

  chainNameToChainId,
  chainIdToChainName,

  currentChainIs,
  addChain,
  switchChainTo,

  UNIQUE_CHAINS_DATA_FOR_EXTENSIONS,

  UNIQUE_CHAINS,
  UNIQUE_CHAIN_IDS,
  UniqueChainName,

  parseEthersTxReceipt,
}
