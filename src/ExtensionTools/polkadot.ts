// =========================================
// Polkadot types
// =========================================
import {documentReadyPromiseAndWindowIsOk} from './utils'

export type KeypairType = 'ed25519' | 'sr25519' | 'ecdsa' | 'ethereum'

interface InjectedAccount {
  address: string
  genesisHash?: string | null
  name?: string
  type?: KeypairType
}

interface InjectedWallet {
  accounts: {
    get(): Promise<InjectedAccount[]>
  }
  metadata?: any
  provider?: any
  signer: Signer
}

interface NonInjectedWallet {
  enable(): Promise<InjectedWallet>

  version: string

  // waiting for PR https://github.com/polkadot-js/extension/pull/1126 being merged
  isEnabled?: boolean
}

export interface SignerPayloadJSON {
  address: string
  blockHash: string
  blockNumber: string
  era: string
  genesisHash: string
  method: string
  nonce: string
  specVersion: string
  tip: string
  transactionVersion: string
  signedExtensions: string[]
  version: number
}

export type SignerPayloadJSONWithAddressOptional = Omit<SignerPayloadJSON, 'address'> & { address?: string }

export interface SignerPayloadRaw {
  data: string
  address: string
  type: 'bytes' | 'payload'
}

export type SignerPayloadRawWithAddressAndTypeOptional = {
  data: string
  address?: SignerPayloadRaw['address']
  type?: SignerPayloadRaw['type']
}

export interface SignerResult {
  id: number
  signature: string //The resulting signature in hex string
}

interface Signer {
  signPayload: (payload: SignerPayloadJSON) => Promise<SignerResult>
  signRaw: (raw: SignerPayloadRaw) => Promise<SignerResult>
  update?: (id: number, status: any) => void
}

// =========================================
// Unique SDK types
// =========================================
export interface UNIQUE_SDK_UnsignedTxPayloadBody {
  signerPayloadJSON: SignerPayloadJSON
  signerPayloadRaw: SignerPayloadRaw
  signerPayloadHex: string
}

export interface UNIQUE_SDK_SignTxResultResponse {
  signature: string
  signatureType: KeypairType
}


// =========================================
// module types
// =========================================
export interface IPolkadotExtensionWalletInfo {
  name: string
  version: string
  isEnabled: boolean | undefined
  prettyName: string
  logo: {
    ipfsCid: string,
    url: string,
  }
}

export interface IPolkadotExtensionWallet extends IPolkadotExtensionWalletInfo, Omit<InjectedWallet, 'accounts'> {
  accounts: IPolkadotExtensionAccount[]
}

export interface IPolkadotExtensionAccount extends Omit<Signer, 'signRaw'> {
  name: string

  address: string
  addressShort: string

  id: string
  wallet: IPolkadotExtensionWalletInfo
  signRaw: (raw: SignerPayloadRawWithAddressAndTypeOptional | string) => Promise<SignerResult>
  // signPayload and update are inherited from Signer

  signer: {
    address: string
    sign: (unsignedTxPayload: UNIQUE_SDK_UnsignedTxPayloadBody) => Promise<UNIQUE_SDK_SignTxResultResponse>
  }

  meta: {
    genesisHash: string | null
    name: string
    source: string
  }
  type: KeypairType
}

export type IPolkadotExtensionGenericInfo = Pick<IPolkadotExtensionWalletInfo, 'name' | 'prettyName' | 'logo'> & {
  webpage: string
}


// =========================================
// constants
// =========================================
const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/'

const KNOWN_POLKADOT_EXTENSIONS: { [K: string]: { logoIpfsCid: string, prettyName: string, webpage: string } } = {
  'polkadot-js': {
    logoIpfsCid: 'QmYWczavyNyh3yM56axyyQLgRqcFQYNKe5cDFPfLL94yrz',
    prettyName: 'Polkadot{.js}',
    webpage: 'https://polkadot.js.org/extension/',
  },
  'subwallet-js': {
    logoIpfsCid: 'QmZ8BvFzGL5DRugJ3pytc1Jo1rTVYjW3mKUWBx7SvaEsdS',
    prettyName: 'Subwallet',
    webpage: 'https://subwallet.app/',
  },
  'talisman': {
    logoIpfsCid: 'QmWHn4kVoG43U5coNhoR7Ec3Vus5YPjo9SkMvoiiLoy2bY',
    prettyName: 'Talisman',
    webpage: 'https://talisman.xyz/',
  },
}
const FALLBACK_WALLET_LOGO_IPFS_CID = 'QmSC1B9X9ugWkfHKtd5guKTidh2qjvgdn8xXzbFrrHMiBM'

const compareTwoStrings = (a: string, b: string): number => a > b ? 1 : a < b ? -1 : 0

const knownPolkadotExtensions: IPolkadotExtensionGenericInfo[] = Object.entries(KNOWN_POLKADOT_EXTENSIONS).map(([name, info]) => {
  return {
    name,
    prettyName: info.prettyName,
    logo: {
      ipfsCid: info.logoIpfsCid,
      url: IPFS_GATEWAY + info.logoIpfsCid,
    },
    webpage: info.webpage,
  }
}).sort((a, b) => compareTwoStrings(a.name, b.name))

const isWeb3Environment = async (): Promise<boolean> => {
  const windowIsOk = await documentReadyPromiseAndWindowIsOk()
  if (!windowIsOk) {
    return false
  }

  const injectedWeb3 = (window as any).injectedWeb3

  return !!injectedWeb3 && Object.keys(injectedWeb3).length !== 0
}

export interface IPolkadotExtensionListWalletsResult {
  wallets: IPolkadotExtensionWalletInfo[]
  info: {
    extensionFound: boolean
    enabledWalletsNumber: number
  }
}

const getWalletInfo = (walletName: string, nonInjectedWallet: NonInjectedWallet): IPolkadotExtensionWalletInfo => {
  // waiting for PR https://github.com/polkadot-js/extension/pull/1126 being merged
  const isEnabled = nonInjectedWallet.isEnabled // walletName === 'polkadot-js' // for testing,

  const prettyName = KNOWN_POLKADOT_EXTENSIONS[walletName]?.prettyName || walletName
  const logo = {
    ipfsCid: KNOWN_POLKADOT_EXTENSIONS[walletName]?.logoIpfsCid || FALLBACK_WALLET_LOGO_IPFS_CID,
    url: IPFS_GATEWAY + (KNOWN_POLKADOT_EXTENSIONS[walletName]?.logoIpfsCid || FALLBACK_WALLET_LOGO_IPFS_CID),
  }

  return {
    name: walletName,
    version: nonInjectedWallet.version,
    prettyName,
    logo,
    isEnabled,
  }
}

const listWallets = async (): Promise<IPolkadotExtensionListWalletsResult> => {
  if (!(await isWeb3Environment())) {
    return {wallets: [], info: {extensionFound: false, enabledWalletsNumber: 0}}
  }

  const walletsArray = Object.entries((window as any).injectedWeb3) as Array<[string, NonInjectedWallet]>

  const wallets = walletsArray.map(([name, injectedWallet]) => getWalletInfo(name, injectedWallet))

  return {
    wallets,
    info: {
      extensionFound: true,
      enabledWalletsNumber: wallets.reduce((acc, wallet) => acc + (wallet.isEnabled ? 1 : 0), 0),
    },
  }
}

export type IPolkadotExtensionLoadWalletByNameResultSafe = {
  result: IPolkadotExtensionWallet
  error: null
} | {
  result: null
  error: Error
}

const loadWalletByNameSafe = async (walletName: string): Promise<IPolkadotExtensionLoadWalletByNameResultSafe> => {
  if (!(await isWeb3Environment())) {
    return {result: null, error: new Error(`now injected web3 found or environment not a browser`)}
  }

  const injectedWeb3 = (window as any).injectedWeb3
  const rawWallet = injectedWeb3[walletName] as NonInjectedWallet

  if (!rawWallet) {
    return {result: null, error: new Error(`Wallet with name ${walletName} not found in "window.injectedWeb3"`)}
  }

  try {
    const walletInfo = getWalletInfo(walletName, rawWallet)

    const wallet = await rawWallet.enable()
    const accounts = await wallet.accounts.get()

    const parsedWallet: IPolkadotExtensionWallet = {
      ...walletInfo,
      ...wallet,
      accounts: accounts.map((account) => {
        const address = account.address
        const addressShort = `${address.slice(0, 5)}...${address.slice(-5)}`

        const id = `${walletName}/${address}`
        const accountName = account.name || `${walletName}/${addressShort}`

        const accountType = account.type || 'sr25519'

        const signRaw = async (payloadRaw: SignerPayloadRawWithAddressAndTypeOptional | string): Promise<SignerResult> => {
          if (!wallet.signer.signRaw) {
            throw new Error(`no signRaw in the wallet ${walletName}`)
          }

          const payload: SignerPayloadRaw = typeof payloadRaw === 'string'
            ? {address, data: payloadRaw, type: 'bytes'}
            : {address, ...payloadRaw, type: payloadRaw.type || 'bytes'}

          return wallet.signer.signRaw(payload)
        }
        const signPayload = async (payloadJSON: SignerPayloadJSONWithAddressOptional): Promise<SignerResult> => {
          if (!wallet.signer.signPayload) {
            throw new Error(`no signPayload in the wallet ${walletName}`)
          }
          return wallet.signer.signPayload({address, ...payloadJSON,})
        }

        const signer = {
          address,
          sign: async (unsignedTxPayload: UNIQUE_SDK_UnsignedTxPayloadBody): Promise<UNIQUE_SDK_SignTxResultResponse> => {
            const signatureResult = await signPayload(unsignedTxPayload.signerPayloadJSON)
            return {
              signatureType: accountType,
              signature: signatureResult.signature,
            }
          }
        }

        const enhancedAccount: IPolkadotExtensionAccount = {
          ...account,
          name: accountName,
          id,
          address,
          addressShort,
          type: accountType,
          meta: {
            genesisHash: account.genesisHash || null,
            name: accountName,
            source: walletName,
          },
          wallet: walletInfo,
          signRaw,
          signPayload,
          update: wallet.signer.update,

          signer,
        }

        return enhancedAccount
      }),
    }
    return {result: parsedWallet, error: null}
  } catch (e: any) {
    return {result: null, error: e}
  }
}

const loadWalletByName = async (walletName: string): Promise<IPolkadotExtensionWallet> => {
  const {result, error} = await loadWalletByNameSafe(walletName)
  if (error) {
    throw error
  }
  return result!
}

export type IPolkadotExtensionLoadWalletsError = Error & {
  extensionNotFound: boolean
  accountsNotFound: boolean
  userHasWalletsButHasNoAccounts: boolean
  userHasBlockedAllWallets: boolean
}

export interface IPolkadotExtensionLoadWalletsResult {
  wallets: IPolkadotExtensionWallet[]
  accounts: IPolkadotExtensionAccount[]

  rejectedWallets: Array<IPolkadotExtensionWalletInfo & {
    error: Error
    isBlockedByUser: boolean
  }>
}

/**
 * Load all wallets and accounts
 * @param onlyEnabled
 * @returns {Promise<IPolkadotExtensionLoadWalletsResult>}
 * @throws {IPolkadotExtensionLoadWalletsError}
 */
const loadWallets = async (onlyEnabled: boolean = false): Promise<IPolkadotExtensionLoadWalletsResult> => {
  if (!(await documentReadyPromiseAndWindowIsOk())) {
    return {wallets: [], accounts: [], rejectedWallets: []}
  }
  if (!(await isWeb3Environment())) {
    const error = new Error(`No injected web3 found`) as IPolkadotExtensionLoadWalletsError

    error.extensionNotFound = true
    error.accountsNotFound = false
    error.userHasWalletsButHasNoAccounts = false
    error.userHasBlockedAllWallets = false

    throw error
  }

  const allWallets = await Promise.all((await listWallets()).wallets
    .filter(wallet => !onlyEnabled || wallet.isEnabled)
    .map(async (wallet) => ({
      info: wallet,
      enabled: await loadWalletByNameSafe(wallet.name)
    }))
  )

  const wallets: IPolkadotExtensionLoadWalletsResult['wallets'] = allWallets
    .filter(wallet => !!wallet.enabled.result)
    .map(wallet => wallet.enabled.result as IPolkadotExtensionWallet)
    .sort((a, b) => compareTwoStrings(a.name, b.name))

  const rejectedWallets: IPolkadotExtensionLoadWalletsResult['rejectedWallets'] = allWallets
    .filter(wallet => !!wallet.enabled.error)
    .map(wallet => {
      const error = wallet.enabled.error as Error

      const result: IPolkadotExtensionLoadWalletsResult['rejectedWallets'][number] = {
        ...wallet.info,
        error,
        isBlockedByUser: error.message.indexOf('is not allowed to interact with this extension') >= 0,
      }

      return result
    })
    .sort((a, b) => compareTwoStrings(a.name, b.name))


  const accounts: IPolkadotExtensionLoadWalletsResult['accounts'] = wallets
    .flatMap(wallet => wallet.accounts)
    .sort((a, b) =>
      compareTwoStrings(a.wallet.name + a.name + a.address, b.wallet.name + b.name + b.address)
    )

  if (!accounts.length) {
    const error = new Error(`No accounts found`) as IPolkadotExtensionLoadWalletsError

    error.extensionNotFound = false
    error.accountsNotFound = true
    error.userHasWalletsButHasNoAccounts = !!wallets.length
    error.userHasBlockedAllWallets = !wallets.length && !!rejectedWallets.length && rejectedWallets.every(w => w.isBlockedByUser)

    throw error
  }

  return {
    wallets,
    rejectedWallets,
    accounts,
  }
}

export type IPolkadotExtensionLoadWalletsResultSafe = {
  result: IPolkadotExtensionLoadWalletsResult
  error: null
} | {
  result: null
  error: IPolkadotExtensionLoadWalletsError
}

const loadWalletsSafe = async (onlyEnabled: boolean = false): Promise<IPolkadotExtensionLoadWalletsResultSafe> => {
  try {
    return {result: await loadWallets(onlyEnabled), error: null}
  } catch (e: any) {
    return {result: null, error: e}
  }
}

export const Polkadot = {
  listWallets,

  enableAndLoadAllWallets: () => loadWallets(false),
  loadEnabledWallets: () => loadWallets(true),

  enableAndLoadAllWalletsSafe: () => loadWalletsSafe(false),
  loadEnabledWalletsSafe: () => loadWalletsSafe(true),

  loadWalletByName,
  loadWalletByNameSafe,

  constants: {
    knownPolkadotExtensions,
    extensionNames: {
      polkadot: 'polkadot-js',
      subwallet: 'subwallet-js',
      talisman: 'talisman',
    }
  }
}
