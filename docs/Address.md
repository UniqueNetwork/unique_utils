# Addresses conversion

## How to start

Import the `Address` object from the package.

```ts 
import {Address} from '@unique-nft/utils'
// or
import {Address} from '@unique-nft/utils/address'
// or can be imported only necessary parts like
import {mirror} from '@unique-nft/utils/address'
mirror.substrateToEthereum('<address>')
```

## Overview

Address is a set of functions (grouped by purpose) for checking, validation, conversion and boxing/unboxing of Substrate and Ethereum addresses. It's written with pure Typescript, which means no WASM dependencies or big libraries. Minified bundled version weight is only 8Kb, and it does not require any other libraries.

Only necessary libraries included: SHA3 (256), blake2b and Base58/64.

CommonJS and IIFE builds are completely bundled, they have no any dependencies or imports.

ESM build has imports for tree shaking in modern building environments (webpack, vite, parcel, etc...)

## Contents

Address consists some useful utilities for substrate and ethereum addresses processing and conversion.
- **[constants](#constants)**: ethereum addresses for static smart contracts and address prefixes.
- **[is](#is)**: set of functions checking whether passed param is substrate address, ethereum address, nested address, etc.
- **[validate](#validate)**: set of validators, i.e. functions throwing an error when passed param is not a valid substrate address, ethereum address, nested address, etc.
- **[collection](#collection)**: converters of collection id <-> collection ethereum address.
- **[nesting](#nesting)**: converters of {collectionId, tokenId} <-> nested ethereum address.
- **[extract](#extract)**: tools to check and extract address in string form or CrossAccountId.
- **[mirror](#mirror)**: converters of substrate and ethereum mirrors.
- **[normalize](#normalize)**: address normalizers (substrate to 42 prefix and ethereum capitalizer).
- **[compare](#compare)**: address comparators.
- **[substrate](#substrate)**: substrate address helpers.

### constants

Some permanent Ethereum addresses and address prefixes.

Prefixes:
```ts
Address.constants.COLLECTION_ADDRESS_PREFIX          // '0x17c4e6453cc49aaaaeaca894e6d9683e'
Address.constants.NESTING_PREFIX                     // '0xf8238ccfff8ed887463fd5e0'
```

CollectionHelpers and ContractHelpers smart contracts addresses:
```ts
Address.constants.STATIC_ADDRESSES.collectionHelpers // '0x6C4E9fE1AE37a41E93CEE429e8E1881aBdcbb54F'
Address.constants.STATIC_ADDRESSES.contractHelpers   // '0x842899ECF380553E8a4de75bF534cdf6fBF64049'
```
_Note: these addresses are really static, i.e. immutable. They are meant to be same between releases._

### is

This object provides methods for checking whether some address meets the expectations.
All methods return `true` or `false`, never throw an error.

#### substrateAddress

The method checks whether an address is a valid Substrate address (with checksum check).

```ts
substrateAddress: (address: string) => boolean
```

Examples:
```ts 
Address.is.substrateAddress('5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ') // true
Address.is.substrateAddress('yGJMj5z32dpBUigGVFgatC382Ti3FNVSKyfgi87UF7f786MJL') // true
Address.is.substrateAddress('0x34055Awqa8Cd2a82b656A3605AB058fB25E943A1') // false
Address.is.substrateAddress('123') // false
Address.is.substrateAddress([]) // false
```


#### ethereumAddress

The method checks whether an address is a valid Ethereum address (input address capitalization doesn't matter).

```ts
ethereumAddress: (address: string) => boolean
```

Examples:
```ts 

Address.is.ethereumAddress('0x34055Awqa8Cd2a82b656A3605AB058fB25E943A1') // true
Address.is.ethereumAddress('0x34055awqa8cd2a82b656a3605ab058fb25e943a1') // true
Address.is.ethereumAddress('0x17c4e6453cc49aaaaeaca894e6d9683e00000001') // true
Address.is.ethereumAddress('0x17C4e6453cC49AAaaEaCA894E6D9683e00000001') // true
Address.is.ethereumAddress('0x34055awqa8cd2a82b656a3605ab058fb25e943a') // false
Address.is.ethereumAddress('123') // false
Address.is.ethereumAddress('5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ') // false
Address.is.ethereumAddress([]) // false
```


#### substratePublicKey

The method checks whether an address is a valid Substrate public key. Input address capitalization doesn't matter, 0x at the start is required.

```ts
substratePublicKey: (address: string) => boolean
```

Examples:
```ts
Address.is.substratePublicKey('0xf8cc75f76d46c3b1c5f270fe06c8ffdeab8e5eab97f2331fb49123b48ceb2a7d') // true
Address.is.substratePublicKey('f8cc75f76d46c3b1c5f270fe06c8ffdeab8e5eab97f2331fb49123b48ceb2a7d')   // false
Address.is.substratePublicKey('0xf8cc75f76d46c3b1c5f270fe06c8ffdeab8e5eab97f2331fb49123b48ceb2a7')  // false
Address.is.substratePublicKey('0x34055Awqa8Cd2a82b656A3605AB058fB25E943A1')       // false
Address.is.substratePublicKey('5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ') // false
Address.is.substratePublicKey('0x34055awqa8cd2a82b656a3605ab058fb25e943a')        // false
Address.is.substratePublicKey('123')  // false
Address.is.substratePublicKey([])     // false
```

#### collectionAddress

The method checks whether an address is a valid collection address (input address capitalization doesn't matter).

```ts
collectionAddress: (address: string) => boolean
```

Examples:
```ts 
Address.is.collectionAddress('0x17c4e6453cc49aaaaeaca894e6d9683e00000001') // true
Address.is.collectionAddress('0x17C4e6453cC49AAaaEaCA894E6D9683e00000001') // true
Address.is.collectionAddress('0x27C4e6453cC49AAaaEaCA894E6D9683e00000001') // false
Address.is.collectionAddress('123') // false
Address.is.collectionAddress('5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ') // false
Address.is.collectionAddress([]) // false
```

#### nestingAddress

This method checks whether an address is a valid nesting address (input address capitalization doesn't matter).

```ts
nestingAddress: (address: string) => boolean
```

Examples:
```ts 
Address.is.nestingAddress('0xF8238Ccfff8Ed887463Fd5E00000007f000000fe') // true
Address.is.nestingAddress('0xf8238ccfff8ed887463fd5e00000007f000000fe') // true
Address.is.nestingAddress('0x17C4e6453cC49AAaaEaCA894E6D9683e00000001')  // false
Address.is.nestingAddress('0x34055awqa8cd2a82b656a3605ab058fb25e943a')   // false
Address.is.nestingAddress('123') // false
Address.is.nestingAddress('5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ') // false
Address.is.nestingAddress([]) // false
```

#### collectionId

This method checks whether the specified number looks like a valid collection id.

```ts
collectionId: (collectionId: number) => boolean
```

Examples:

```ts 
Address.is.collectionId(1) // true
Address.is.collectionId(101) // true
Address.is.collectionId(0xffffffff) // true
Address.is.collectionId(0) // false
Address.is.collectionId(0xffffffff + 1) // false (out of range [1, 0xffffffff])
Address.is.collectionId(-5) // false
Address.is.collectionId('id') // false
Address.is.collectionId([]) // false
Address.is.collectionId('0x17c4e6453cc49aaaaeaca894e6d9683e00000001') // false 
// for this case please refer to Address.is.collectionAddress
```

#### tokenId

This method checks whether the specified number is a valid token id.

```ts
tokenId: (tokenId: number) => boolean
```

Examples:

```ts 
Address.is.tokenId(11) //  true
Address.is.tokenId(111) //  true
Address.is.tokenId(0xffffffff) //  true
Address.is.tokenId(-5) //  false
Address.is.tokenId('id') // false
Address.is.tokenId('0x17c4e6453cc49aaaaeaca894e6d9683e00000001') // false
Address.is.tokenId([]) // false
```

#### crossAccountId

This method checks whether a specified argument is a valid CrossAccountId object.

```ts
crossAccountId: (obj: any) => boolean
```

Examples:

```ts
Address.is.crossAccountId({Ethereum: '0x17c4E6453cC49aAaaEACA894e6A9683e00000005'}) // true
Address.is.crossAccountId({Substrate: '5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ'}) // true
Address.is.crossAccountId({Substrate: '5HgvUDiRm5yjRSrrF9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ'}) // false
Address.is.crossAccountId({Ethereum: '5HgvUDiRm5yjRSrrF9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ'}) // false
Address.is.crossAccountId('5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ') // false 
// because it's not a object but a string even though it's a valid address

Address.is.crossAccountId('5') // false
Address.is.crossAccountId(110) // false
Address.is.crossAccountId([]) // false
``` 

#### crossAccountIdUncapitalized

The method checks whether a CrossAccountId object is passed with uncapitalized property.

```ts
crossAccountIdUncapitalized: (obj: any) => boolean
```

Examples:

```ts
Address.is.crossAccountIdUncapitalized({ethereum: '0x17c4E6453Cc49AAAaEACa894E6a9683e00000005'}) // true
Address.is.crossAccountIdUncapitalized({substrate: '5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ'}) // true
Address.is.crossAccountIdUncapitalized({Ethereum: '0x17c4E6453Cc49AAAaEACa894E6a9683e00000005'}) // false
Address.is.crossAccountIdUncapitalized({Substrate: '5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ'}) // false
Address.is.crossAccountIdUncapitalized('0x17c4E6453Cc49AAAaEACa894E6a9683e00000005')       // false
Address.is.crossAccountIdUncapitalized('5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ') // false
Address.is.crossAccountIdUncapitalized('address') // false
Address.is.crossAccountIdUncapitalized(5) // false
Address.is.crossAccountIdUncapitalized([]) // false
```

#### substrateAddressObject

The method checks whether a passed argument is a valid Substrate address object.

```ts
substrateAddressObject: (obj: any) => boolean
```

Examples:

```ts
Address.is.substrateAddressObject({Substrate: '5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ'}) // true
Address.is.substrateAddressObject({Substrate: 'yGJMj5z32dpBUigGVFgatC382Ti3FNVSKyfgi87UF7f786MJL'}) // true
Address.is.substrateAddressObject({Substrate: '0x17c4E6453Cc49AAAaEACa894E6a9683e00000005'}) // false
Address.is.substrateAddressObject({Ethereum: '0x17c4E6453Cc49AAAaEACa894E6a9683e00000005'}) // false
Address.is.substrateAddressObject('5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ') // false
Address.is.substrateAddressObject('address') // false
Address.is.substrateAddressObject(50) // false
Address.is.substrateAddressObject([]) // false
```

#### ethereumAddressObject

The method checks whether a passed argument is a valid Substrate address object.

```ts
ethereumAddressObject: (obj: any) => boolean
```

Examples:

```ts
Address.is.ethereumAddressObject({Ethereum: '0x17c4E6453Cc49AAAaEACa894E6a9683e00000005'}) // true
Address.is.ethereumAddressObject({Substrate: '0x17c4E6453Cc49AAAaEACa894E6a9683e00000005'}) // false
Address.is.ethereumAddressObject('0x17c4E6453Cc49AAAaEACa894E6a9683e00000005') // false
Address.is.ethereumAddressObject('address') // false
Address.is.ethereumAddressObject(5) // false
Address.is.ethereumAddressObject([]) // false
```

#### substrateAddressObjectUncapitalized

The method checks whether an argument is a valid Substrate object with uncapitalized property.

```ts
substrateAddressObjectUncapitalized: (obj: any) => boolean
```

Examples:

```ts
Address.is.substrateAddressObjectUncapitalized({substrate: '5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ'}) // true
Address.is.substrateAddressObjectUncapitalized({Substrate: '5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ'}) // false
Address.is.substrateAddressObjectUncapitalized({substrate: '0x17c4E6453Cc49AAAaEACa894E6a9683e00000005'}) // false
Address.is.substrateAddressObjectUncapitalized('5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ') // false
Address.is.substrateAddressObjectUncapitalized('address') // false 
Address.is.substrateAddressObjectUncapitalized(55) // false 
Address.is.substrateAddressObjectUncapitalized([]) // false 
```

#### ethereumAddressObjectUncapitalized

The method checks whether an argument is a valid Ethereum object with uncapitalized property.

```ts
ethereumAddressObjectUncapitalized: (obj: any) => boolean
```

Examples:

```ts
Address.is.ethereumAddressObjectUncapitalized({ethereum: '0x17c4E6453Cc49AAAaEACa894E6a9683e00000005'}) // true
Address.is.ethereumAddressObjectUncapitalized({ethereum: '5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ'}) // false
Address.is.ethereumAddressObjectUncapitalized({Ethereum: '0x17c4E6453Cc49AAAaEACa894E6a9683e00000005'}) // false
Address.is.ethereumAddressObjectUncapitalized({substrate: '5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ'}) // false
Address.is.ethereumAddressObjectUncapitalized('0x17c4E6453Cc49AAAaEACa894E6a9683e00000005') // false
Address.is.ethereumAddressObjectUncapitalized('address') // true
Address.is.ethereumAddressObjectUncapitalized(55) // true
Address.is.ethereumAddressObjectUncapitalized([]) // true
```

### validate

This object provides methods for checking whether some address meets the expectations. The difference from the [is](#is) object is that this object methods throw an error when the address cannot be checked. If the address is correct, the methods return `true`.

#### substrateAddress

This method checks whether the address is a valid Substrate address.

```ts
substrateAddress: (address: string) => boolean
```

Examples:

```ts
Address.validate.substrateAddress('5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ') // true

Address.validate.substrateAddress('5HgvUDiRm5yjRSrrG9B6q6km7aazkXMxvFLHPZpA13pmwCJQ') // throws the error 
// Invalid decoded address checksum

Address.validate.substrateAddress('address') // throws the error 
Address.validate.substrateAddress(101) // throws the error 
Address.validate.substrateAddress([]) // throws the error 
```

#### ethereumAddress

This method checks whether an address is a valid Ethereum address.

```ts
ethereumAddress: (address: string) => boolean
```

Examples:

```ts 
Address.validate.ethereumAddress('0x34097A6Aa8Cd2a82b656A3605AB058fB25E943A1') // true 

Address.validate.ethereumAddress('0x34055Awqa8Cd2a82b656A3605AB058fB25E943A1') // throws the error 
// address "0x34055Awqa8Cd2a82b656A3605AB058fB25E943A1" is not valid ethereum address

Address.validate.ethereumAddress('address') // throws the error 
Address.validate.ethereumAddress(101) // throws the error 
Address.validate.ethereumAddress([]) // throws the error 
```

#### substratePublicKey

The method checks whether an address is a valid Substrate public key. Input address capitalization doesn't matter, 0x at the start is required.

```ts
substratePublicKey: (address: string) => boolean
```

Examples:
```ts
Address.validate.substratePublicKey('0xf8cc75f76d46c3b1c5f270fe06c8ffdeab8e5eab97f2331fb49123b48ceb2a7d') // true
Address.validate.substratePublicKey('f8cc75f76d46c3b1c5f270fe06c8ffdeab8e5eab97f2331fb49123b48ceb2a7d')   // throws an error
Address.validate.substratePublicKey('0xf8cc75f76d46c3b1c5f270fe06c8ffdeab8e5eab97f2331fb49123b48ceb2a7')  // throws an error
Address.validate.substratePublicKey('0x34055Awqa8Cd2a82b656A3605AB058fB25E943A1')       // throws an error
Address.validate.substratePublicKey('5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ') // throws an error
Address.validate.substratePublicKey('0x34055awqa8cd2a82b656a3605ab058fb25e943a')        // throws an error
Address.validate.substratePublicKey('123')  // throws an error
Address.validate.substratePublicKey([])     // throws an error
```

#### nestingAddress

This method checks whether an address is a valid nesting address (input address capitalization doesn't matter).

```ts 
nestingAddress: (address: string) => boolean
```

Examples:

```ts 
Address.validate.nestingAddress('0xF8238Ccfff8Ed887463Fd5E00000007f000000fe') // true
Address.validate.nestingAddress('0xf8238ccfff8ed887463fd5e00000007f000000fe') // true
Address.validate.nestingAddress('0x17C4e6453cC49AAaaEaCA894E6D9683e00000001')  // throws the error
Address.validate.nestingAddress('0x34055awqa8cd2a82b656a3605ab058fb25e943a')   // throws the error
Address.validate.nestingAddress('123') // throws the error
Address.validate.nestingAddress('5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ') // throws the error
Address.validate.nestingAddress([]) // throws the error
```

#### collectionId

This method checks whether a number is a token id.

```ts
collectionId: (collectionId: number) => boolean
```

Examples:

```ts
Address.validate.collectionId(5) // true
Address.validate.collectionId(105) // true/
Address.validate.collectionId(0xffffffff) // true
Address.validate.collectionId(0) // throws the error
Address.validate.collectionId(0xffffffff + 1) // throws the error (out of range [1, 0xffffffff])
Address.validate.collectionId(-5) // throws the error
Address.validate.collectionId('id') // throws the error
Address.validate.collectionId([]) // throws the error
```

#### tokenId

This method checks whether the specified number is a valid token id.

```ts 
tokenId: (tokenId: number) => boolean
```

Examples:

```ts 
Address.validate.tokenId(11) //  true
Address.validate.tokenId(111) //  true
Address.validate.tokenId(0xffffffff) //  true
Address.validate.tokenId(-5) //  throws the error
Address.validate.tokenId('id') // throws the error
Address.validate.tokenId('0x17c4e6453cc49aaaaeaca894e6d9683e00000001') // throws the error
Address.validate.tokenId([]) // throws the error
```


### collection

This object provides methods for converting between addresses and Ids of a collection in both directions. The methods work with Ethereum addresses.

#### idToAddress

The method gets a collection address by its id. Returns an address in the Ethereum format if id is correct, and throws the error if this is not so.

```ts
idToAddress: (collectionId: number) => string 
```

Examples:

```ts
Address.collection.idToAddress(5) // '0x17c4E6453Cc49AAAaEACa894E6d9683e00000005'
Address.collection.idToAddress(105) // '0x17c4e6453CC49aaaAEAcA894e6d9683E00000069'

Address.collection.idToAddress(-5) // throws the error 
// collectionId should be a number between 0 and 0xffffffff

Address.collection.idToAddress('0x17c4e6453cc49aaaaeaca894e6d9683e00000001') // throws the error
Address.collection.idToAddress('id') // throws the error
Address.collection.idToAddress([]) // throws the error
```

#### addressToId

The method gets a collection id by its address. Returns an id if an address is correct, and throws the error if this is not so.

```ts
addressToId: (address: string) => number
```

Examples:

```ts
Address.collection.addressToId('0x17c4E6453Cc49AAAaEACa894E6d9683e00000005') // 5
Address.collection.addressToId('0x17c4e6453CC49aaaAEAcA894e6d9683E00000069') // 105

Address.collection.addressToId('0x17c4E6453Cc49AAAEACa894E6a9683e00000005') // throws the error 
//address 0x17c4E6453Cc49AAAaEACa894E6a9683e00000005 is not a collection address

Address.collection.addressToId('5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCCD') //throws the error
Address.collection.addressToId('address') //throws the error
Address.collection.addressToId(101) //throws the error
Address.collection.addressToId([]) //throws the error
```

### nesting

This object provides methods for converting nesting addresses to ids and vice versa.  The methods work for Ethereum addresses.

#### addressToIds

The method gets a collectionId and a tokenId for by an address. Returns Ids if an address is a nesting address, and throws the error if this is not so.

```ts
addressToIds: (address: string) => {
   collectionId: number
   tokenId: number
}
```

Examples:

```ts
Address.nesting.addressToIds('0xf8238CCFff8ED887463fD5E00000000500000001')
// {collectionId: 5, tokenId: 1}

Address.nesting.addressToIds('0xf8238CCfFf8ED887463FD5E00000000a0000000A')
// {collectionId: 10, tokenId: 10}

Address.nesting.addressToIds('0x17c4E6453Cc49AAAaEACa894E6a9683e00000005') // throws the error 
// address 0x17c4E6453Cc49AAAaEACa894E6a9683e00000005 is not a nesting address

Address.nesting.addressToIds('5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ') // throws the error
Address.nesting.addressToIds('address') // throws the error
Address.nesting.addressToIds(102) // throws the error
Address.nesting.addressToIds([]) // throws the error
```

#### idsToAddress

The method gets a nesting address by the collection and token ids.

```ts
idsToAddress: (collectionId: number, tokenId: number) => string
```

Examples:

```ts
Address.nesting.idsToAddress(10, 5) // '0xf8238CcffF8eD887463Fd5e00000000a00000005'
Address.nesting.idsToAddress(101, 50) // '0xf8238ccFfF8ed887463Fd5E00000006500000032'

Address.nesting.idsToAddress(-1, 5) // throws the error 
// collectionId should be a number between 0 and 0xffffffff

Address.nesting.idsToAddress(-10, -15) // throws the error
Address.nesting.idsToAddress('id', -15) // throws the error
Address.nesting.idsToAddress('id', 'id2') // throws the error
Address.nesting.idsToAddress([], 15) // throws the error
Address.nesting.idsToAddress('id', []) // throws the error
```

### extract

The object provides methods to get a validated Substrate or Ethereum address from string or CrossAccountId
(capitalized or not, i.e. `{"Substrate": "..."}` and `{"substrate": "..."}` are both valid, same for Ethereum/ethereum).

#### address
#### addressSafe
#### addressNormalized
#### addressNormalizedSafe

These methods return an address (string) from an object or an address.  
Methods with suffix *Normalized return normalized address for Substrate and capitalized address for Ethereum address.  
Safe methods return string or null, methods without `*Safe` suffix throw an error on incorrect input.

```ts
address: (address: string | object) => string
addressSafe: (address: string | object) => string
addressNormalized: (address: string | object) => string
addressNormalizedSafe: (address: string | object) => string
```

Examples:

Notes: 
1. `*Safe` methods are used just like `address` and `addressNormalized` but they don't throw an error
on incorrect input and just return `null`
2. All methods can take address in any valid form, normalized or not, in any format,
with CrossAccountId wrapped, or just a string:

```ts
Address.extract.address('yGJMj5z32dpBUigGVFgatC382Ti3FNVSKyfgi87UF7f786MJL') 
Address.extract.address('5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ') // in any format / encoded with any ss58 prefix 
Address.extract.address('0x17c4E6453Cc49aaaaeaca894E6a9683e00000005') 
Address.extract.address('0x17c4e6453cc49aaaaeaca894e6a9683e00000005') // lowercase
Address.extract.address({Substrate: 'yGJMj5z32dpBUigGVFgatC382Ti3FNVSKyfgi87UF7f786MJL'})
Address.extract.address({substrate: 'yGJMj5z32dpBUigGVFgatC382Ti3FNVSKyfgi87UF7f786MJL'})
Address.extract.address({Ethereum: '0x17c4E6453Cc49aaaaeaca894E6a9683e00000005'})
Address.extract.address({ethereum: '0x17c4E6453Cc49aaaaeaca894E6a9683e00000005'})
```

So, examples:

```ts 
Address.extract.address('yGJMj5z32dpBUigGVFgatC382Ti3FNVSKyfgi87UF7f786MJL')
// yGJMj5z32dpBUigGVFgatC382Ti3FNVSKyfgi87UF7f786MJL
Address.extract.addressNormalized('yGJMj5z32dpBUigGVFgatC382Ti3FNVSKyfgi87UF7f786MJL')
// '5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ'

Address.extract.address('0x17c4E6453Cc49aaaaeaca894E6a9683e00000005')
// '0x17c4E6453Cc49aaaaeaca894E6a9683e00000005'
Address.extract.addressNormalized('0x17c4e6453cc49aaaaeaca894e6a9683e00000005')
// '0x17c4E6453Cc49aaaaeaca894E6a9683e00000005'

Address.extract.crossAccountId('yGJMj5z32dpBUigGVFgatC382Ti3FNVSKyfgi87UF7f786MJL')
Address.extract.crossAccountId('yGJMj5z32dpBUigGVFgatC382Ti3FNVSKyfgi87UF7f786MJL')
Address.extract.crossAccountId({Substrate: 'yGJMj5z32dpBUigGVFgatC382Ti3FNVSKyfgi87UF7f786MJL'})
// {Substrate: 'yGJMj5z32dpBUigGVFgatC382Ti3FNVSKyfgi87UF7f786MJL'}

Address.extract.crossAccountIdNormalized('yGJMj5z32dpBUigGVFgatC382Ti3FNVSKyfgi87UF7f786MJL')
// {Substrate: '5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ'}

Address.extract.crossAccountId('0x17c4E6453Cc49aaaaeaca894E6a9683e00000005')
Address.extract.crossAccountId({Ethereum: '0x17c4E6453Cc49aaaaeaca894E6a9683e00000005'})
Address.extract.crossAccountId({ethereum: '0x17c4E6453Cc49aaaaeaca894E6a9683e00000005'})
// {Ethereum: '0x17c4E6453Cc49aaaaeaca894E6a9683e00000005'}

Address.extract.crossAccountIdNormalized('0x17c4E6453Cc49aaaaeaca894E6a9683e00000005')
// {Ethereum: '0x17c4E6453Cc49aaaaeaca894E6a9683e00000005'}
```

Safe methods don't throw error on invalid input:

```ts
Address.extract.addressSafe('yGJMj5z32dpBUigGVFgatC382Ti3FNVSKyfgi87UF7f786MJL') // returns same string
Address.extract.addressSafe('yGJMj5z32dpBUigGVFgatC382Ti3FNVSKyfgi87UF7f786MJ')  // returns null
Address.extract.addressSafe('')  // returns null
Address.extract.addressSafe({})  // returns null
Address.extract.addressSafe(0)   // returns null
Address.extract.addressSafe()    // returns null
```

#### enhancedCrossAccountId
#### enhancedCrossAccountIdSafe

These methods validate passed address in any form: string, capitalized or uncapitalized CrossAccountId and
return an `EnhancedCrossAccountId`

```ts
type EnhancedCrossAccountId = {
  Substrate: string         // or Ethereum: string // depends on passed address type or CrossAccountId contents
  address: string           // in normalized form, for Substrate address it's encoded with ss58Prefix 42 (5...), for Ethereum address it's capitalized
  addressSS58: string       // in SS58 format, makes sense only for Substrate address, encoded in passed format (ss58prefix), for Ethereum address it's the same as `address`
  type: 'Substrate' | 'Ethereum'
  isEthereum: boolean
  isSubstrate: boolean
}

enhancedCrossAccountId: (address: string | object, ss58Prefix?: number) => EnhancedCrossAccountId
enhancedCrossAccountIdSafe: (address: string | object, ss58Prefix?: number) => EnhancedCrossAccountId
```

For Ethereum addresses `ss58Prefix` has nothing in common, so it's ignored
and both `address` and `addressSS58` are same.

Examples:

```ts
Address.extract.enhancedCrossAccountId('yGJMj5z32dpBUigGVFgatC382Ti3FNVSKyfgi87UF7f786MJL')
Address.extract.enhancedCrossAccountId({Substrate: 'yGJMj5z32dpBUigGVFgatC382Ti3FNVSKyfgi87UF7f786MJL'})
Address.extract.enhancedCrossAccountId({substrate: 'yGJMj5z32dpBUigGVFgatC382Ti3FNVSKyfgi87UF7f786MJL'})
Address.extract.enhancedCrossAccountId('0x17c4E6453Cc49aaaaeaca894E6a9683e00000005')
Address.extract.enhancedCrossAccountId({Ethereum: '0x17c4E6453Cc49aaaaeaca894E6a9683e00000005'})
Address.extract.enhancedCrossAccountId({ethereum: '0x17c4E6453Cc49aaaaeaca894E6a9683e00000005'})

// with format (ss58 prefix):
Address.extract.enhancedCrossAccountId('5Fp3dxhLyxkzrGE6Niqdvfy5B35duX7PcLqPpwJKaYE2bHah', 255)
//{
//  Substrate: '5Fp3dxhLyxkzrGE6Niqdvfy5B35duX7PcLqPpwJKaYE2bHah',
//  address: '5Fp3dxhLyxkzrGE6Niqdvfy5B35duX7PcLqPpwJKaYE2bHah', 
//  addressSS58: 'yGJMj5z32dpBUigGVFgatC382Ti3FNVSKyfgi87UF7f786MJL',
//  type: 'Substrate'
//  isSubstrate: true
//  isEthereum: false
//}

```

Same for `enhancedCrossAccountIdSafe` method, but it returns null on invalid input,
while `enhancedCrossAccountId` throws an error.

#### addressForScanNormalized
#### addressForScanNormalizedSafe

Returns:  
- if input is substrate address/crossAccountId, normalized (prefix 42) substrate address  
- if input is ethereum address/crossAccountId, lowercased ethereum address
- otherwise, throw if `addressForScanNormalized` called or return null if `addressForScanNormalizedSafe` called

Examples:

```ts
Address.extract.addressForScanNormalized('yGJMj5z32dpBUigGVFgatC382Ti3FNVSKyfgi87UF7f786MJL') // 5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ
Address.extract.addressForScanNormalized({Substrate: 'yGJMj5z32dpBUigGVFgatC382Ti3FNVSKyfgi87UF7f786MJL'}) // 5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ
Address.extract.addressForScanNormalized({substrate: 'yGJMj5z32dpBUigGVFgatC382Ti3FNVSKyfgi87UF7f786MJL'}) // 5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ
Address.extract.addressForScanNormalized('0xf8cC75F76d46c3b1c5F270Fe06c8FFdeAB8E5eaB') // 0xf8cc75f76d46c3b1c5f270fe06c8ffdeab8e5eab
Address.extract.addressForScanNormalized({Ethereum: '0xf8cC75F76d46c3b1c5F270Fe06c8FFdeAB8E5eaB'}) // 0xf8cc75f76d46c3b1c5f270fe06c8ffdeab8e5eab
Address.extract.addressForScanNormalized({ethereum: '0xf8cC75F76d46c3b1c5F270Fe06c8FFdeAB8E5eaB'}) // 0xf8cc75f76d46c3b1c5f270fe06c8ffdeab8e5eab

Address.extract.addressForScanNormalizedSafe('abc') // null
Address.extract.addressForScanNormalizedSafe({ethereum: 'abc'}) // null
Address.extract.addressForScanNormalizedSafe(1) // null
Address.extract.addressForScanNormalizedSafe([]) // null
Address.extract.addressForScanNormalizedSafe() // null
```

#### substrateOrMirrorIfEthereum
#### substrateOrMirrorIfEthereumNormalized

The methods return a Substrate address, or a Substrate mirror if an Ethereum address is passed.  
Input: address or CrossAccountId  
Output: substrate address, for ethereum address input it's always normalized

```ts
substrateOrMirrorIfEthereum: (address: string | object) => string
substrateOrMirrorIfEthereumSafe: (address: string | object) => string | null
substrateOrMirrorIfEthereumNormalized: (address: string | object) => string
substrateOrMirrorIfEthereumNormalizedSafe: (address: string | object) => string | null
```

Examples:

```ts
Address.extract.substrateOrMirrorIfEthereum('yGGUrFj1wrgxk9VdjNGFRHcLLXRmtXVBkfmBpZUxQh9WNkGwy')
// 'yGGUrFj1wrgxk9VdjNGFRHcLLXRmtXVBkfmBpZUxQh9WNkGwy'

Address.extract.substrateOrMirrorIfEthereumNormalized('yGGUrFj1wrgxk9VdjNGFRHcLLXRmtXVBkfmBpZUxQh9WNkGwy')
Address.extract.substrateOrMirrorIfEthereum('5Fp3dxhLyxkzrGE6Niqdvfy5B35duX7PcLqPpwJKaYE2bHah')
Address.extract.substrateOrMirrorIfEthereum('0x17c4E6453Cc49aaaaeaca894E6a9683e00000005')
// '5Fp3dxhLyxkzrGE6Niqdvfy5B35duX7PcLqPpwJKaYE2bHah'

Address.to.substrateOrMirrorIfEthereum('yGJMjes32dpBUigGVFgatC382Ti3FNVSKyfgi87UF7f786MJL') // throws an error
Address.to.substrateOrMirrorIfEthereum('address') // throws an error
Address.to.substrateOrMirrorIfEthereum({}) // throws an error
Address.to.substrateOrMirrorIfEthereum(55) // throws an error
Address.to.substrateOrMirrorIfEthereum([]) // throws an error
```


### mirror

The object provides the methods for converting a Substrate address to an Ethereum mirror and vice versa.

#### substrateToEthereum

The method converts a Substrate address to an Ethereum mirror. The second optional parameter allows specifying whether it is needed to validate checksum. Checksum is a part of a Substrate address along with prefix and public key.

```ts
substrateToEthereum: (address: string, ignoreChecksum?: boolean | undefined) => string
```

Examples:

```ts
Address.mirror.substrateToEthereum('yGJMj5z32dpBUigGVFddtC382Ti3FNVSKyfgi87UF7f786MJL')
// '0xf8cC75F76d46c3b1c5F270Fe06c8FFdeAB8E5eaB'

Address.mirror.substrateToEthereum('5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ')
// '0xf8cC75F76d46c3b1c5F270Fe06c8FFdeAB8E5eaB'

Address.mirror.substrateToEthereum('yGJMj5z32dpBUigGVFddtC382Ti3FNVSKyfgi87UF7f786MJL') // throws the error

Address.mirror.substrateToEthereum('yGJMj5z32dpBUigGVFddtC382Ti3FNVSKyfgi87UF7f786MJL', true) 
// '0xF8CC75f76d46C3B1c5f270fb90be901A731a5a0F'
// the same address as above, but checksum is ignored

Address.mirror.substrateToEthereum('0x17c4E6453Cc49AAAaEACa894E6a9683e00000005') // throws the error
Address.mirror.substrateToEthereum('address') // throws the error
Address.mirror.substrateToEthereum(101) // throws the error
Address.mirror.substrateToEthereum([]) // throws the error
```

#### ethereumToSubstrate

This method converts an Ethereum mirror address to a Substrate address. It throws an error if a passed parameter is invalid.

As the second optional parameter, you can pass the SS58 format for encoding. The default value is 42.

```ts
ethereumToSubstrate: (evmAddress: string, ss58Format?: number) => string
```

Examples:

```ts
Address.mirror.ethereumToSubstrate('0x17c4E6453Cc49AAAaEACa894E6a9683e00000005')
// '5Fp3dxhLyxkzrGE6Niqdvfy5B35duX7PcLqPpwJKaYE2bHah'

Address.mirror.ethereumToSubstrate('0x17c4E6453Cc49AAAaEACa894E6a9683e00000005', 2)
// 'GKfJH3DcKmvbv3Y9RegpdL5KdMsiBva4ig9DbaH4LSXLbzS'

Address.mirror.ethereumToSubstrate('0x17c4E6453Cc49AAAaEACa894E6a9683e0005') // throws the error
Address.mirror.ethereumToSubstrate('yGJMj5z32dpBUigGVFddtC382Ti3FNVSKyfgi87UF7f786MJL') // throws the error
Address.mirror.ethereumToSubstrate('address') // throws the error
Address.mirror.ethereumToSubstrate(5) // throws the error
Address.mirror.ethereumToSubstrate([]) // throws the error
```

### normalize

The object provides the methods for normalizing addresses.

#### substrateAddress

The method converts a Substrate address to a normalized format (by default). However, you can use the second optional parameter to convert an address to a format with needed prefix.

The method throws an error if conversion fails.

```ts
substrateAddress: (address: string, prefix?: number) => string
```

Examples:

```ts
Address.normalize.substrateAddress('yGJMj5z32dpBUigGVFgatC382Ti3FNVSKyfgi87UF7f786MJL')
// '5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ'

Address.normalize.substrateAddress('5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ', 255)
// 'yGJMj5z32dpBUigGVFgatC382Ti3FNVSKyfgi87UF7f786MJL'

address.normalize.substrateAddress('yGJMj5z32dpBUigGVFgatC382Ti3FNVSKyfgi87UF7f786MJL', 255)
// 'yGJMj5z32dpBUigGVFgatC382Ti3FNVSKyfgi87UF7f786MJL'

address.normalize.substrateAddress('yGJMj5z32dpBUigGVFgatC382Ti3FNVSKyfgi87UF7f786MJL', 7391)
// 'unk9GwxLcJ7VHE75RgDYuRjuewZBGWHWvwgdVMSN3pPz9bY52'

Address.normalize.substrateAddress('yGJMj5z32dpBUigGVFgatC772Ti3FNVSKyfgi87UF7f786MJL') // throws the error
Address.normalize.substrateAddress('address') // throws the error
Address.normalize.substrateAddress(101) // throws the error
Address.normalize.substrateAddress([]) // throws the error
```

#### ethereumAddress

The method normalizes an Ethereum address (capitalizes letters).

```ts
ethereumAddress: (address: string) => string
```

Examples:

```ts
Address.normalize.ethereumAddress('0x17c4E6453Cc49AAAaEACa894E6a9683e00000005')
// '0x17c4E6453cC49aAaaEACA894e6A9683e00000005'

Address.normalize.ethereumAddress('0x17c4E6453Cc49aaaaeaCa894E6a9683e00000005')
// '0x17c4E6453cC49aAaaEACA894e6A9683e00000005'

Address.normalize.ethereumAddress('yGJMj5z32dpBUigGVFgatC772Ti3FNVSKyfgi87UF7f786MJL') // throws the error
Address.normalize.ethereumAddress('address') // throws the error
Address.normalize.ethereumAddress(100) // throws the error
Address.normalize.ethereumAddress([]) // throws the error
```

### compare

The object provides the method for comparing addresses. The methods return `true` or `false` depending on whether the addresses are equal. The methods never throw an error.

#### ethereumAddresses

The method compares two Ethereum addresses.

```ts 
ethereumAddresses: (
  address1: string | {Ethereum: string} | {ethereum: string}, 
  address2: string | {Ethereum: string} | {ethereum: string}
) => boolean
```

Examples:

```ts
Address.compare.ethereumAddresses(
  '0x17c4E6453Cc49AAAaEACa894E6a9683e00000005', 
  '0x17c4E6453Cc49AAAaEACa894E6a9683e00000005'
) // true

Address.compare.ethereumAddresses(
  '0x17c4E6453Cc49aaaaeaca894E6a9683e00000005', 
  '0x17c4E6453Cc49AAAaEACa894E6a9683e00000005'
) // true

Address.compare.ethereumAddresses(
  {Ethereum: '0x17c4E6453Cc49aaaaeaca894E6a9683e00000005'}, 
  {ethereum: '0x17c4E6453Cc49AAAaEACa894E6a9683e00000005'}
) // true

Address.compare.ethereumAddresses(
  '0x17c4E6453Cc49aaaaeaca894E6a9683e00000005', 
  {ethereum: '0x17c4E6453Cc49AAAaEACa894E6a9683e00000005'}
) // true

Address.compare.ethereumAddresses(
  '0x17c4E6453Cc49AAAaEACa894E6a9683e00000005', 
  '0x17c4E6454Cc49AAAaEACa894E6a9683e00000005'
) // false

Address.compare.ethereumAddresses(
  '5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ', 
  '5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ'
) // false (for equal Substrate addresses)

Address.compare.ethereumAddresses(5, '0x17c4E6453Cc49AAAaEACa894E6a9683e00000005') // false 
Address.compare.ethereumAddresses(5, 2) // false 
Address.compare.ethereumAddresses('address', '0x17c4E6453Cc49AAAaEACa894E6a9683e00000005') // false 
Address.compare.ethereumAddresses(5, 'address') // false
Address.compare.ethereumAddresses(5, []) // false
Address.compare.ethereumAddresses([], 'address') // false
```

#### substrateAddresses

The method compares two Substrate addresses.

```ts
substrateAddresses: (
  address1: string | {Substrate: string} | {substrate: string}, 
  address2: string | {Substrate: string} | {substrate: string}
) => boolean
```

Examples:

```ts
Address.compare.substrateAddresses(
  '5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ', 
  '5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ'
) // true

Address.compare.substrateAddresses(
  'yGJMj5z32dpBUigGVFgatC382Ti3FNVSKyfgi87UF7f786MJL',
  '5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ'
) // true

Address.compare.substrateAddresses(
  {Substrate: '5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ'}, 
  {substrate: '5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ'}
) // true

Address.compare.substrateAddresses(
  {Substrate: '5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ'},
  '5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ'
) // true

Address.compare.substrateAddresses(
  '5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCCD',
  '5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ'
) // false

Address.compare.substrateAddresses(
  '0x17c4E6453Cc49AAAaEACa894E6a9683e00000005', 
  '0x17c4E6453Cc49AAAaEACa894E6a9683e00000005'
) // false (for identical Ethereum addresses)

Address.compare.substrateAddresses('5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCCD', 2) // false 

Address.compare.substrateAddresses(5, 2) // false 
Address.compare.substrateAddresses('address', '2') // false 
Address.compare.substrateAddresses([], 2) // false 
Address.compare.substrateAddresses([], 'address') // false 
```

### substrate

Helper methods for Substrate addresses.

#### encode

The method encodes a bigint number, or a hex string, or a Uint8Array to an address. The second optional parameter allows specifying a SS58 format (the default value is 42).

```ts
encode: (
  key: string | bigint | Uint8Array, 
  ss58Format?: number
) => string
```

Examples:

```ts
Address.substrate.encode(112534837424802406592435682904163557942962658937798059779637765046482955348605n)
// '5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ'

Address.substrate.encode('0xf8cc75f76d46c3b1c5f270fe06c8ffdeab8e5eab97f2331fb49123b48ceb2a7d')
// '5HgvUDiRm5yjRSrrG9B6q6km7KLzkXMxvFLHPZpA13pmwCJQ'

Address.substrate.encode('0xf8cc75f76d46c3b1c5f270fe06c8ffdeab8e5eab97f2331fb49123b48ceb2a7d', 255)
// 'yGJMj5z32dpBUigGVFgatC382Ti3FNVSKyfgi87UF7f786MJL'

Address.substrate.encode('0xf8cc75f76d46c3b1c5f270fe06c8ffdeab8e5eab97f2331fb49123b48ceb2a7d', 7391)
// 'unk9GwxLcJ7VHE75RgDYuRjuewZBGWHWvwgdVMSN3pPz9bY52'

Address.substrate.encode(new Uint8Array( [
  248, 204, 117, 247, 109,  70, 195,
  177, 197, 242, 112, 254,   6, 200,
  255, 222, 171, 142,  94, 171, 151,
  242,  51,  31, 180, 145,  35, 180,
  140, 235,  42, 125
]), 7391)
// 'unk9GwxLcJ7VHE75RgDYuRjuewZBGWHWvwgdVMSN3pPz9bY52'

Address.substrate.encode('address') // throws the error
Address.substrate.encode(15) // throws the error
Address.substrate.encode([]) // throws the error
```

#### decode

The method decodes the specified address and returns a Decode Substrate Address Result object. If an address is invalid, the method throws the error.

```ts
decode: (
  address: string, 
  ignoreChecksum?: boolean, 
  ss58Format?: number
) => DecodeSubstrateAddressResult
``` 

Examples:

```ts
Address.substrate.decode('yGJMj5z32dpBUigGVFgatC382Ti3FNVSKyfgi87UF7f786MJL')
//{
//  u8a: Uint8Array(32) [
//    248, 204, 117, 247, 109,  70, 195,
//    177, 197, 242, 112, 254,   6, 200,
//    255, 222, 171, 142,  94, 171, 151,
//    242,  51,  31, 180, 145,  35, 180,
//    140, 235,  42, 125
//  ],
//  hex: '0xf8cc75f76d46c3b1c5f270fe06c8ffdeab8e5eab97f2331fb49123b48ceb2a7d',
//  bigint: 112534837424802406592435682904163557942962658937798059779637765046482955348605n
//} 

Address.substrate.decode('yGJMj5z32dpBUigGVFgatC382Ti3FNVSKyfgi87UF7f786MJL', true, 255)
//{
//  u8a: Uint8Array(32) [
//    248, 204, 117, 247, 109,  70, 195,
//    177, 197, 242, 112, 254,   6, 200,
//    255, 222, 171, 142,  94, 171, 151,
//    242,  51,  31, 180, 145,  35, 180,
//    140, 235,  42, 125
//  ],
//  hex: '0xf8cc75f76d46c3b1c5f270fe06c8ffdeab8e5eab97f2331fb49123b48ceb2a7d',
//  bigint: 112534837424802406592435682904163557942962658937798059779637765046482955348605n
//}

Address.substrate.decode('0x17c4E6453Cc49AAAaEACa894E6a9683e00000005') // throws the error
// Decoding 0x17c4E6453Cc49AAAaEACa894E6a9683e00000005: Non-base58 character

Address.substrate.decode('address') // throws the error
Address.substrate.decode(11) // throws the error
Address.substrate.decode([]) // throws the error
``` 