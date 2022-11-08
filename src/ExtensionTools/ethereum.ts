import {documentReadyPromiseAndWindowIsOk} from './utils'

export const windowIsOkSync = (): boolean => {
  return typeof window !== 'undefined' && !!(window as any).ethereum;
}

type IEthereumExtensionError = Error & {
  extensionFound: boolean
  isUserRejected: boolean
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

type UNIQUE_CHAIN = 'unique' | 'quartz' | 'opal' | 'sapphire'
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
const currentChainIs: Record<UNIQUE_CHAIN, () => boolean> & { anyUniqueChain: (chainId: string | number) => boolean } = {
  unique: isUniqueChainFactory('unique'),
  quartz: isUniqueChainFactory('quartz'),
  opal: isUniqueChainFactory('opal'),
  sapphire: isUniqueChainFactory('sapphire'),
  anyUniqueChain: (chainId: string | number | null | undefined): boolean => {
    if (!chainId) return false

    const chainName: UNIQUE_CHAIN | undefined =
      chainIdToChainName[typeof chainId === "number" ? chainId : parseInt(chainId, 16)]

    return (typeof chainName === 'string')
  }
}


export type IEthereumAccountResult = {
  address: string
  chainId: number
  error: null
} | {
  address: null
  chainId: number | null
  error: IEthereumExtensionError
}

const getOrRequestAccounts = async (requestInsteadOfGet: boolean = false): Promise<IEthereumAccountResult> => {
  const windowIsOk = await documentReadyPromiseAndWindowIsOk()
  if (!windowIsOk || !(window as any).ethereum) {
    const error = new Error('No extension found') as IEthereumExtensionError
    error.extensionFound = false
    error.isUserRejected = false

    return {
      address: null,
      chainId: null,
      error
    }
  }

  const ethereum = (window as any).ethereum
  let accounts: string[] = []
  try {
    accounts = await ethereum.request({method: requestInsteadOfGet ? 'eth_requestAccounts' : 'eth_accounts'})
    const chainId = parseInt(ethereum.chainId, 16)

    return {
      address: accounts[0],
      chainId,
      error: null
    }
  } catch (_error: any) {
    // EIP-1193 userRejectedRequest error code is 4001
    // If this happens, the user rejected the connection request.

    const error = _error as IEthereumExtensionError
    error.isUserRejected = _error.code === 4001
    error.extensionFound = true

    const chainIdStr = (window as any).ethereum?.chainId
    const chainId = typeof chainIdStr === 'string' ? parseInt(chainIdStr, 16) : NaN

    return {
      address: null,
      chainId: isNaN(chainId) ? null : chainId,
      error,
    }
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
    chainId: "0x22b0",
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
    chainId: "0x22b1",
    chainName: "Quartz by Unique",
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
    chainId: "0x22b2",
    chainName: "Opal by Unique",
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
    chainId: "0x22b3",
    chainName: "Sapphire by Unique",
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

const addChain: Record<UNIQUE_CHAIN, () => Promise<void>> & { anyChain: (chainData: AddEthereumChainParameter) => Promise<void> } = {
  unique: () => addChainToExtension(UNIQUE_CHAINS_DATA_FOR_EXTENSIONS.unique),
  quartz: () => addChainToExtension(UNIQUE_CHAINS_DATA_FOR_EXTENSIONS.quartz),
  opal: () => addChainToExtension(UNIQUE_CHAINS_DATA_FOR_EXTENSIONS.opal),
  sapphire: () => addChainToExtension(UNIQUE_CHAINS_DATA_FOR_EXTENSIONS.sapphire),
  anyChain: (chainData: AddEthereumChainParameter) => addChainToExtension(chainData),
}

const switchToChain = async (chainId: number | string): Promise<void> => {
  const windowIsOk = await documentReadyPromiseAndWindowIsOk()
  if (!windowIsOk) return

  const parsedChainId: string = typeof chainId === 'string' ? chainId : '0x' + chainId.toString(16)

  await (window as any).ethereum.request({method: 'wallet_switchEthereumChain', params: [{chainId: parsedChainId}]})
}
const switchChainTo: Record<UNIQUE_CHAIN, () => Promise<void>> & { anyChain: (chainId: number | string) => Promise<void> } = {
  unique: () => switchToChain(chainNameToChainId.unique),
  quartz: () => switchToChain(chainNameToChainId.quartz),
  opal: () => switchToChain(chainNameToChainId.opal),
  sapphire: () => switchToChain(chainNameToChainId.sapphire),
  anyChain: (chainId) => switchToChain(chainId)
}

export type UpdateReason = 'account' | 'chain'

const subscribeOnChanges = (cb: (result: { reason: UpdateReason, chainId: number | null, address: string | null }) => void): (() => void) => {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    return () => undefined
  }

  const ethereum = (window as any).ethereum

  const getAccounts = (reason: UpdateReason) => {
    if (ethereum.chainId && ethereum.selectedAddress) {
      cb({reason, address: ethereum.selectedAddress, chainId: parseInt(ethereum.chainId, 16)})
    } else {
      getOrRequestAccounts().then(({chainId, address, error}) => {
        if (error) {
          throw error
        }

        cb({reason, chainId, address})
      })
    }
  }

  ethereum.on('accountsChanged', () => {
    getAccounts('account')
  })
  ethereum.on('chainChanged', () => {
    getAccounts('chain')
  })
  return () => {
    ethereum.removeListener('accountsChanged', getAccounts)
    ethereum.removeListener('networkChanged', getAccounts)
  }
}

export type {UNIQUE_CHAIN}

export const Ethereum = {
  getOrRequestAccounts,
  requestAccounts: () => getOrRequestAccounts(true),
  getAccounts: () => getOrRequestAccounts(),
  subscribeOnChanges,

  chainNameToChainId,
  chainIdToChainName,

  currentChainIs,
  addChain,
  switchChainTo,

  UNIQUE_CHAINS_DATA_FOR_EXTENSIONS,
}
