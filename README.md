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
// import {mirror} from '@unique-nft/utils/address'


Address.is.ethereumAddressObject({Ethereum: '0xf8cC75F76d46c3b1c5F270Fe06c8FFdeAB8E5eaB'}) //true
Address.validate.substrateAddress('5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ') // true
Address.mirror.substrateToEthereum('5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ') // 0xf8cC75F76d46c3b1c5F270Fe06c8FFdeAB8E5eaB
Address.collection.idToAddress(105) // '0x17c4e6453CC49aaaAEAcA894e6d9683E00000069'
Address.nesting.idsToAddress(10, 5) // '0xf8238CcffF8eD887463Fd5e00000000a00000005'
Address.to.substrateNormalizedOrMirrorIfEthereum('0xf8cC75F76d46c3b1c5F270Fe06c8FFdeAB8E5eaB') // '5GwWnwbYRzwvcyAmQqCBB4h5JNspv8xPxpUm77wXbooxS3t5'
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
Utf8.u8aToString([97, 32, 240, 159, 140, 183]) // "a 🌷"
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
