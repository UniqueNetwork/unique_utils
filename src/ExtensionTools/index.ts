import {Ethereum} from './ethereum'
import {Polkadot} from './polkadot'

const ExtensionTools = {
  Ethereum,
  Polkadot,
}

export {ExtensionTools, Ethereum, Polkadot}

export default ExtensionTools

// =========================================
// types
// =========================================



export type {
  AddEthereumChainParameter,
  UNIQUE_CHAIN,
  UpdateReason,
  IEthereumAccountResult,
  IEthereumExtensionError,
} from './ethereum'

export type IGetAccountsUnsafe = typeof Ethereum.getAccountsUnsafe
export type IRequestAccountsUnsafe = typeof Ethereum.requestAccountsUnsafe

export type IEnableAndLoadAllWalletsUnsafe = typeof Polkadot.enableAndLoadAllWalletsUnsafe
export type ILoadEnabledWalletsUnsafe = typeof Polkadot.loadEnabledWalletsUnsafe

export type {
  IPolkadotExtensionWallet,
  IPolkadotExtensionWalletInfo,
  IPolkadotExtensionAccount,
  IPolkadotExtensionGenericInfo,
  IPolkadotExtensionLoadWalletsResult,
  IPolkadotExtensionListWalletsResult,
  IPolkadotExtensionLoadWalletByNameResult,
  IPolkadotExtensionLoadWalletsError,
  SignerPayloadJSON,
  SignerPayloadRaw,
  SignerPayloadRawWithAddressAndTypeOptional,
  SignerPayloadJSONWithAddressOptional,
  SignerResult,
} from './polkadot'
