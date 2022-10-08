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
  IEthereumRequestAccountsResult,
} from './ethereum'

export type {
  IPolkadotExtensionWallet,
  IPolkadotExtensionWalletInfo,
  IPolkadotExtensionAccount,
  IPolkadotExtensionGenericInfo,
  IPolkadotExtensionLoadWalletsResult,
  IPolkadotExtensionListWalletsResult,
  IPolkadotExtensionLoadWalletByNameResult,
  SignerPayloadJSON,
  SignerPayloadRaw,
  SignerPayloadRawWithAddressAndTypeOptional,
  SignerPayloadJSONWithAddressOptional,
  SignerResult,
} from './polkadot'
