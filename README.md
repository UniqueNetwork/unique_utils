# Unique utils

Package containing some low-level utils useful for everyday coding with Substrate and web3.

Provides neat and no-extra-dependencies tools to interact with Substrate and Ethereum addresses,
strings (utf8 and utf16 encoding/decoding) and more.

For example, Address doesn't depend on Polkadot libraries, WASM, and even ethers.js.  
Minified version of address.js weights just 8 Kb with all hashing and crypto being bundled in.
And there is no WASM at all when you need just check or convert an address.

Zero dependencies. Definitely typed. Works in browser and Node.js.

## Address

Address object provide several tools for Substrate and Ethereum addresses.  
Like checking, validating, mirroring, boxing and unboxing, formatting and capitalizing.

```ts 
import {Address} from '@unique-nft/utils'
// or
// import {Address} from '@unique-nft/utils/address'
// or
// import {extract} from '@unique-nft/utils/address'

Address.is.ethereumAddressObject({Ethereum: '0xf8cC75F76d46c3b1c5F270Fe06c8FFdeAB8E5eaB'}) //true
Address.validate.substrateAddress('5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ') // true
Address.mirror.substrateToEthereum('5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ') // 0xf8cC75F76d46c3b1c5F270Fe06c8FFdeAB8E5eaB
Address.collection.idToAddress(105) // '0x17c4e6453CC49aaaAEAcA894e6d9683E00000069'
Address.nesting.idsToAddress(10, 5) // '0xf8238CcffF8eD887463Fd5e00000000a00000005'
Address.extract.substrateOrMirrorIfEthereum('0xf8cC75F76d46c3b1c5F270Fe06c8FFdeAB8E5eaB') // '5GwWnwbYRzwvcyAmQqCBB4h5JNspv8xPxpUm77wXbooxS3t5'
Address.extract.addressForScanNormalized('yGJMj5z32dpBUigGVFgatC382Ti3FNVSKyfgi87UF7f786MJL') // 5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ
Address.extract.addressForScanNormalized('0xf8cC75F76d46c3b1c5F270Fe06c8FFdeAB8E5eaB') // 0xf8cc75f76d46c3b1c5f270fe06c8ffdeab8e5eab
```

And much more! Mirroring, packing/unpacking CrossAccountId in different formats, guessing address types and more.

Also, encoding, decoding and formatting Substrate addresses without WASM or any heavy libraries.

**[Full documentation for the Address util](https://github.com/fend25/unique_utils/blob/master/docs/Address.md)**

## StringUtils

StringUtils provides tools to encode/decode UTF-8 and UTF-16 strings and to pack/unpack hex strings.

```ts
import {Utf8, Utf16, HexString} from '@unique-nft/utils/string'
// or import just all in one entry point:
// import {StringUtils} from '@unique-nft/utils'

Utf8.stringToU8a('a 🌷') // Uint8Array [97, 32, 240, 159, 140, 183]
Utf8.u8aToString([97, 32, 240, 159, 140, 183]) // "a 🌷" // it takes usual number arrays too
Utf8.hexStringToString('0x6120f09f8cb7') // "a 🌷"
Utf8.stringToHexString('a 🌷') // "0x6120f09f8cb7"
Utf8.lengthInBytes('a 🌷') // 6

Utf16.stringToU16a('a 🌷') // Uint16Array [97, 32, 55356, 57143]
Utf16.u16aToString([97, 32, 55356, 57143]) // "a 🌷"
Utf16.lengthInBytes('a 🌷') // 4

HexString.toU8a('0x6120f09f8cb7') // Uint8Array [97, 32, 240, 159, 140, 183]
HexString.fromU8a([97, 32, 240, 159, 140, 183]) // "0x6120f09f8cb7"

// even super complex strings!
Utf8.lengthInBytes('👨🏼‍👩🏼‍👧🏼‍👧🏼') // 41
Utf16.lengthInBytes('👨🏼‍👩🏼‍👧🏼‍👧🏼') // 19
```

**[Full documentation for the UTF and hex string helpers](https://github.com/fend25/utf-helpers#readme)**

## Extension tools

### Ethereum

A tiny (0.5 Kb) and zero-dependency module to detect whether metamask extension presents,
detect whether the access is granted and get account(s) or request access.

Node.js-safe, it will not throw unexpected errors like "cannot find window".  
Also, these methods are safe in a common way, they don't throw errors, 
but return wrapped result or error with additional info.

The `ExtensionsTools`, `Ethereum` and `Polkadot` modules should be imported directly from  
`@unique-nft/utils/extension` because they are not available at `@unique-nft/utils`.

For Ethereum browser extensions, like metamask:

```ts
import {ExtensionTools} from '@unique-nft/utils/extension'

const Ethereum = ExtensionTools.Ethereum
//or
import {Ethereum} from '@unique-nft/utils/extension'

const {address, chainId} = await Ethereum.getAccounts()
const {result, error} = await Ethereum.getAccountsSafe()
// or
const {address, chainId} = await Ethereum.requestAccounts()
const {result, error} = await Ethereum.requestAccountsSafe()
// or
const {address, chainId} = await Ethereum.getOrRequestAccounts(boolean) // true - resuest, false - get
const {result, error} = await Ethereum.getOrRequestAccountsSafe(boolean) // true - resuest, false - get

//subscribe on chainId or SelectedAddress changes:
const unsubscribe = Ethereum.subscribeOnChanges(({reason, address, chainId}) => {/*...*/})
```

Also, Ethereum extension tool provide some helpers to work with Unique chains.  
All this helpers have all 4 chains, so every helper can be used for `unique`, `quartz`, `opal` and `sapphire`.

```ts
import {Ethereum, UniqueChainName} from '@unique-nft/utils/extension'
Ethereum.currentChainIs.opal() // boolean
Ethereum.currentChainIs.byName('opal') // boolean
Ethereum.currentChainIs.byName(UniqueChainName.opal) // boolean

Ethereum.addChain.quartz()
Ethereum.addChain.byName('quartz')
Ethereum.addChain.byName(UniqueChainName.quartz)

Ethereum.switchChainTo.unique()
Ethereum.switchChainTo.byName('unique')
Ethereum.switchChainTo.byName(UniqueChainName.unique)

Ethereum.chainNameToChainId.unique // 8880
Ethereum.chainIdToChainName[8881] // quartz

// non-related with extension helpers
Ethereum.parseEthersTxReceipt(txReceipt) // unstable
```

More complex example, when we want to request user to grant access.  
If user has already granted access, it will work silently, just like `getAccounts`.

```ts
import {Ethereum} from '@unique-nft/utils/extension'
import {IEthereumExtensionError} from './ethereum'

try {
  const {address, chainId} = await Ethereum.requgestAccounts()
  let provider = new ethers.providers.Web3Provider(window.ethereum)
  console.log(ethers.utils.formatEther(await provider.getBalance(result.selectedAddress)))
} catch (e: IEthereumExtensionError) {
  /* note:
  if we call Ethereum.getAccounts(), there may be one more type of error: 
  
  if (e.needToRequestAccess){
    alert(`Please, grant access to your account`)
    await Ethereum.requestAccounts()
  }
  */
  if (e.extensionNotFound) {
    alert(`Please install some ethereum browser extension`)
  } else if (e.userRejected) {
    alert(`But whyyyyyyy?`)
  } else {
    alert(`Connection to ethereum extension failed: ${e.message}`)
  }
}
```

### Polkadot

A tiny (1.5 Kb) and zero-dependency (no WASM, no anything) module to work with Polkadot extensions family - 
Polkadot.js, Subwallet, Talisman and other Polkadot.js-compatible wallets.  
Actually it's a neat and really useful replacement for the extension-dapp module.

This module works in browsers with multiple wallets, it can detect whether there is an extension installed
and contains the boilerplate logic around detecting wallets, it's access and so on.

Node.js-safe, it will not throw unexpected errors like "cannot find window".  
Also, these methods are safe in a common way, they don't throw errors,
but return wrapped result or error with additional info.

The `ExtensionsTools`, `Ethereum` and `Polkadot` modules should be imported directly  
from `@unique-nft/utils/extension` because they are not available at `@unique-nft/utils`.

```ts
import {ExtensionTools} from '@unique-nft/utils/extension'
//or
import {Polkadot} from '@unique-nft/utils/extension'
try {
  const result = await Polkadot.enableAndLoadAllWallets()
  result.accounts[0].address // string
} catch(e) {
  if (e.extensionNotFound) {
    alert(`Please install some polkadot.js compatible extension`)
  } else if (e.accountsNotFound) {
    if (e.userHasWalletsButHasNoAccounts) {
      alert(`Please, create an account in your wallet`)
    } else if (e.userHasBlockedAllWallets) {
      alert(`Please, grant access to at least one of your accounts`)
      await Polkadot.requestAccounts()
    }
  } else {
    alert(`Connection to polkadot extension failed: ${e.message}`)
  }
}
```

Also, it contains ready signer object for the [Unique SDK](https://www.npmjs.com/package/@unique-nft/sdk):

```ts
import {Polkadot} from '@unique-nft/utils/extension'
import {Sdk} from '@unique-nft/sdk'

const {accounts} = await Polkadot.enableAndLoadAllWallets() // Some checks are omitted
const account = accounts[0] // For the simplicity

const sdk = new Sdk({
  baseUrl: 'https://rest.opal.uniquenetwork.dev/v1',
  signer: account.signer
})

// or provide it (or override default one) on demand with specific request:

const sdkWithoutSigner = new Sdk({baseUrl: 'https://rest.opal.uniquenetwork.dev/v1'})

const result = await sdkWithoutSigner.balance.transfer.submitWaitResult({
  amount: 1,
  address: account.address,
  destination: "5..." // some another address
}, {
  signer: account.signer
})
```

##### Return types

`enableAndLoadAllWallets` and `loadEnabledWallets` return such result:

```ts
export interface IPolkadotExtensionLoadWalletsResult {
  wallets: IPolkadotExtensionWallet[]
  accounts: IPolkadotExtensionAccount[]

  rejectedWallets: Array<IPolkadotExtensionWalletInfo & {
    error: Error
    isBlockedByUser: boolean
  }>
}

export type IPolkadotExtensionLoadWalletsError = Error & {
  extensionNotFound: boolean
  accountsNotFound: boolean
  userHasWalletsButHasNoAccounts: boolean
  userHasBlockedAllWallets: boolean
}
```

where `IPolkadotExtensionAccount` is:

```ts
export interface IPolkadotExtensionAccount extends Omit<Signer, 'signRaw'> {
  name: string
  id: string
  address: string
  addressShort: string
  
  wallet: {
    name: string
    version: string
    isEnabled: boolean | undefined
    prettyName: string
    logo: {
      ipfsCid: string,
      url: string,
    }
  }
  
  signRaw: (raw: SignerPayloadRawWithAddressAndTypeOptional | string) => Promise<SignerResult>
  signPayload: (payload: SignerPayloadJSON) => Promise<SignerResult>
  update?: (id: number, status: any) => void

  signer: {
    address: string
    sign: (unsignedTxPayload: UNIQUE_SDK_UnsignedTxPayloadBody) => Promise<UNIQUE_SDK_SignTxResultResponse>
  }

  meta: {
    genesisHash: string | null
    name: string
    source: string
  }
  type: KeypairType // 'ed25519' | 'sr25519' | 'ecdsa' | 'ethereum'
}
```
