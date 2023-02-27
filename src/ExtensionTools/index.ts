import {Ethereum} from './ethereum'
import {Polkadot} from './polkadot'

const ExtensionTools = {
  Ethereum,
  Polkadot,
}

const UniqueChainName = Ethereum.UniqueChainName

export {ExtensionTools, Ethereum, Polkadot, UniqueChainName}

export default ExtensionTools

// =========================================
// types
// =========================================


export type {
  AddEthereumChainParameter,
  UNIQUE_CHAIN,
  UpdateReason,
  IEthereumExtensionResult,
  IEthereumExtensionError,
  IEthereumExtensionResultSafe,
} from './ethereum'

export type {
  IPolkadotExtensionWallet,
  IPolkadotExtensionWalletInfo,
  IPolkadotExtensionAccount,
  IPolkadotExtensionGenericInfo,
  IPolkadotExtensionLoadWalletsResult,
  IPolkadotExtensionListWalletsResult,
  IPolkadotExtensionLoadWalletsResultSafe,
  IPolkadotExtensionLoadWalletByNameResultSafe,
  IPolkadotExtensionLoadWalletsError,
  SignerPayloadJSON,
  SignerPayloadRaw,
  SignerPayloadRawWithAddressAndTypeOptional,
  SignerPayloadJSONWithAddressOptional,
  SignerResult,
} from './polkadot'
