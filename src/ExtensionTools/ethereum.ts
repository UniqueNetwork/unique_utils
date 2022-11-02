export interface IEthereumRequestAccountsResult {
  accounts: string[]
  selectedAddress: string | null
  info: {
    extensionFound: boolean
    uniqueChainName?: UNIQUE_CHAIN,
    chainId?: string
    chainIdNumber?: number
    userRejected?: boolean
    error?: Error
  }
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
const UNIQUE_CHAIN_IDS: Record<UNIQUE_CHAIN, number> = {
  unique: 8880,
  quartz: 8881,
  opal: 8882,
  sapphire: 8883
}
const chainNameByChainId: Record<number, UNIQUE_CHAIN> = {
  8880: 'unique',
  8881: 'quartz',
  8882: 'opal',
  8883: 'sapphire'
}


export const requestAccounts = async (): Promise<IEthereumRequestAccountsResult> => {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    return {accounts: [], selectedAddress: null, info: {extensionFound: false}}
  }
  const ethereum = (window as any).ethereum
  let accounts: string[] = []
  try {
    accounts = await ethereum.request({method: 'eth_requestAccounts'})
    const chainIdNumber = parseInt(ethereum.chainId, 16)

    return {
      accounts,
      selectedAddress: ethereum.selectedAddress,
      info: {
        extensionFound: true,
        chainId: ethereum.chainId,
        chainIdNumber,
        uniqueChainName: chainNameByChainId[chainIdNumber],
      },
    }
  } catch (error: any) {
    // EIP-1193 userRejectedRequest error code is 4001
    // If this happens, the user rejected the connection request.

    return {
      accounts: [],
      selectedAddress: null,
      info: {extensionFound: true, userRejected: error.code === 4001, error},
    }
  }
}

export const getAccounts = async (): Promise<IEthereumRequestAccountsResult> => {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    return {accounts: [], selectedAddress: null, info: {extensionFound: false}}
  }
  const ethereum = (window as any).ethereum

  const accounts: string[] = await ethereum.request({method: 'eth_accounts'})
  const chainIdNumber = parseInt(ethereum.chainId, 16)
  return {
    accounts,
    selectedAddress: ethereum.selectedAddress,
    info: {
      extensionFound: true,
      chainId: ethereum.chainId,
      chainIdNumber,
      uniqueChainName: chainNameByChainId[chainIdNumber],
    },
  }
}

export const addChainToMetamask = async (chainData: AddEthereumChainParameter): Promise<void> => {
  const safeGetAccountsResult = await getAccounts()
  if (!safeGetAccountsResult.info.extensionFound) {
    throw new Error(`No browser extension found`)
  }
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


export const UNIQUE_CHAINS_DATA_FOR_EXTENSIONS: Record<UNIQUE_CHAIN, AddEthereumChainParameter> = {
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

const AddUniqueChainToMetamask: Record<UNIQUE_CHAIN, () => Promise<void>> = {
  unique: () => addChainToMetamask(UNIQUE_CHAINS_DATA_FOR_EXTENSIONS.unique),
  quartz: () => addChainToMetamask(UNIQUE_CHAINS_DATA_FOR_EXTENSIONS.quartz),
  opal: () => addChainToMetamask(UNIQUE_CHAINS_DATA_FOR_EXTENSIONS.opal),
  sapphire: () => addChainToMetamask(UNIQUE_CHAINS_DATA_FOR_EXTENSIONS.sapphire),
}

export type {UNIQUE_CHAIN}

export const Ethereum = {
  requestAccounts,
  getAccounts,
  addChainToMetamask,
  UNIQUE_CHAIN_IDS,
  UNIQUE_CHAINS_DATA_FOR_EXTENSIONS,
  AddUniqueChainToMetamask,
}
