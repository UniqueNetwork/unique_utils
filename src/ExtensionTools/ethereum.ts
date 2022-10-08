export interface IEthereumRequestAccountsResult {
  accounts: string[]
  selectedAddress: string | null
  info: {
    extensionFound: boolean
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


export const requestAccounts = async (): Promise<Promise<IEthereumRequestAccountsResult>> => {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    return {accounts: [], selectedAddress: null, info: {extensionFound: false}}
  }
  const ethereum = (window as any).ethereum
  let accounts: string[] = []
  try {
    accounts = await ethereum.request({method: 'eth_requestAccounts'})
    return {
      accounts,
      selectedAddress: ethereum.selectedAddress,
      info: {
        extensionFound: true,
        chainId: ethereum.chainId,
        chainIdNumber: parseInt(ethereum.chainId, 16),
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
  return {
    accounts,
    selectedAddress: ethereum.selectedAddress,
    info: {
      extensionFound: true,
      chainId: ethereum.chainId,
      chainIdNumber: parseInt(ethereum.chainId, 16),
    },
  }
}

export const addChainToMetamask = async(chainData: AddEthereumChainParameter): Promise<void> => {
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

export const Ethereum = {
  requestAccounts,
  getAccounts,
  addChainToMetamask,
}
