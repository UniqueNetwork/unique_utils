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
Address.extract.addressForScan('yGJMj5z32dpBUigGVFgatC382Ti3FNVSKyfgi87UF7f786MJL') // 5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ
Address.extract.addressForScan('0xf8cC75F76d46c3b1c5F270Fe06c8FFdeAB8E5eaB') // 0xf8cc75f76d46c3b1c5f270fe06c8ffdeab8e5eab
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

const getAccountsResult = await Ethereum.getAccounts()
/*
{
  accounts: ['0xf8cC75F76d46c3b1c5F270Fe06c8FFdeAB8E5eaB'],
  info: {extensionFound: true, chainId: '0x22b2', chainIdNumber: 8882},
  selectedAddress: 0xf8cC75F76d46c3b1c5F270Fe06c8FFdeAB8E5eaB
}
// or, when there is no granted account:
{accounts: [], selectedAddress: null, info: {extensionFound: true, chainId: '0x22b2', chainIdNumber: 8882}}
// or, when there is no extension:
{accounts: [], selectedAddress: null, info: {extensionFound: false}}
// in Node.js `info.extensionFound is` always false.
*/
```

Simple example which just checks extension and tries to get an address without prompting user:

```ts
import {Ethereum} from '@unique-nft/utils/extension'

let result = await Ethereum.getAccounts()

if (result.info.extensionFound && result.selectedAddress) {
  //woohoo, let's create a Web3 Provider like that:
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  console.log(ethers.utils.formatEther(await provider.getBalance(result.selectedAddress)))
}
```

More complex example, when we want to request user to grant access.  
_Note: If user has already granted access, it will work silently, just like_ `getAccounts`.

```ts
import {Ethereum} from '@unique-nft/utils/extension'

const result = await Ethereum.requestAccounts()

if (result.selectedAddress) {
  //woohoo, let's create a Web3 Provider like that:
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  console.log(ethers.utils.formatEther(await provider.getBalance(result.selectedAddress)))
} else {
  if (result.info.userRejected) {
    console.log(`Oops, user doesn't want us. Let's show them some kawaii popup`)
  } else {
    console.error(result.info.error)
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

const result = await Polkadot.enableAndLoadAllWallets()

result.info.extensionFound // boolean, in Node.js it's always false.

result.accounts[0].address // string
```

Also, it contains ready signer object for the [Unique SDK](https://www.npmjs.com/package/@unique-nft/sdk):

```ts
import {Polkadot} from '@unique-nft/utils/extension'
import {Sdk} from '@unique-nft/sdk'

const {accounts} = await Polkadot.enableAndLoadAllWallets() // Some checks are omitted
const account = accounts[0] // For the simplicity

const sdk = new Sdk({
  baseUrl: 'https://rest.opal.uniquenetwork.dev/v1',
  signer: account.uniqueSdkSigner
})

// or provide it (or override default one) on demand with specific request:

const sdkWithoutSigner = new Sdk({baseUrl: 'https://rest.opal.uniquenetwork.dev/v1'})

const result = await sdkWithoutSigner.balance.transfer.submitWaitResult({
  amount: 1,
  address: account.address,
  destination: "5..." // some another address
}, {
  signer: account.uniqueSdkSigner
})
```

##### Return types

`enableAndLoadAllWallets` and `loadEnabledWallets` return such result:

```ts
export interface IPolkadotExtensionLoadWalletsResult {
  info: {
    extensionFound: boolean
    accountsFound: boolean
    userHasWalletsButHasNoAccounts: boolean
    userHasBlockedAllWallets: boolean
  }

  accounts: IPolkadotExtensionAccount[]
  
  wallets: IPolkadotExtensionWallet[]

  rejectedWallets: Array<{
    name: string
    version: string
    isEnabled: boolean | undefined
    prettyName: string
    logo: {
      ipfsCid: string,
      url: string,
    }
    error: Error
    isBlockedByUser: boolean
  }>
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

  uniqueSdkSigner: {
    sign: (unsignedTxPayload: SDK_UnsignedTxPayloadBody) => Promise<SDK_SignTxResultResponse>
  }

  meta: {
    genesisHash: string | null
    name: string
    source: string
  }
  type: KeypairType // 'ed25519' | 'sr25519' | 'ecdsa' | 'ethereum'
}
```
