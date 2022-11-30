import {describe, expect, test} from 'vitest'
import {Address} from '../Address'

describe('addresses', () => {
  const opal = '5D7WxWqqUYNm962RUNdf1UTCcuasXCigHFMGG4hWX6hkp7zU'
  const quartz = 'yGDnKaHASMGaWSKS4Tv3SNQpTyJH89Ao3LfhgzcMbdhz6y2VT'
  const unique = 'unfZsSFU21ZtJwkEztT1Tc7c6T9R9GxseJgeUDwFQLSs8UDLb'
  const ethMirror = '0x2E61479A581F023808AAa5f2EC90bE6c2b250102'
  const doubleMirror = '5HikVEnsQT3U9LyTh5X9Bewud1wv4WkS7ovxrHRMCT2DFZPY'

  const quartzMangled = 'yGDnKaHASMGaWSKS4Tv3SNQpTyJH89Ao3LfhgzcMbdhz6y2V'
  const opalMangled = '5D7WxWqqUYNm962RUNdf1UTCcuasXCigHFMGG4hWX6hkp7z'
  const ethAddressMangled = '0xFbbdd160b7A5Dc08C1D803Fe5E03Ba213D91041'

  const ethAddress = '0xFbbdd160b7A5Dc08C1D803Fe5E03Ba213D910415'
  const ethAddressLowercase = '0xfbbdd160b7a5dc08c1d803fe5e03ba213d910415'
  const subMirrorOfEthAddress = '5Hao9DtZTNpCqUju8oGmtaCzau7zWMR3rBQkFfvE3suTu6aE'
  const subMirrorOfEthAddressPrefix255 = 'yGJFbkzDAL71x8i9Y8LgZFWaFwHpF8KVQubmAzDaKAVBp4BnU'

  test.concurrent('is', () => {
    expect(Address.is.substrateAddress(opal)).toBe(true)
    expect(Address.is.substrateAddress(ethAddress)).toBe(false)
    expect(Address.is.substrateAddress('123')).toBe(false)
    expect(Address.is.substrateAddress([] as any)).toBe(false)
    expect(Address.is.substrateAddress({} as any)).toBe(false)

    //@ts-ignore
    expect(Address.is.substrateAddress()).toBe(false)

    expect(Address.is.ethereumAddress(opal)).toBe(false)
    expect(Address.is.ethereumAddress(ethAddress)).toBe(true)
    expect(Address.is.ethereumAddress('123')).toBe(false)
  })

  test.concurrent('subToEthMirror', () => {
    expect(Address.mirror.substrateToEthereum(opal)).toBe(ethMirror)
    expect(() => {
      Address.mirror.substrateToEthereum('123')
    }).toThrowError()
  })

  test.concurrent('ethToSubMirror', () => {
    expect(Address.mirror.ethereumToSubstrate(ethMirror)).toBe(doubleMirror)
    expect(Address.mirror.ethereumToSubstrate(ethAddress)).toBe(subMirrorOfEthAddress)
    expect(() => {
      Address.mirror.ethereumToSubstrate('123')
    }).toThrowError()
  })

  test.concurrent('normalizeSubstrateAddress', () => {
    expect(Address.normalize.substrateAddress(quartz)).toBe(opal)
    expect(Address.normalize.substrateAddress(quartz, 7391)).toBe(unique)
    expect(() => {
      Address.normalize.substrateAddress('123')
    }).toThrowError()
  })

  test.concurrent('normalizeEthereumAddress', () => {
    expect(Address.normalize.ethereumAddress(ethMirror.toLowerCase())).toBe(ethMirror)
    expect(() => {
      Address.normalize.ethereumAddress('123')
    }).toThrowError()
  })

  test.concurrent('Collection address ', () => {
    expect(Address.collection.idToAddress(127))
      .toBe('0x17c4e6453cC49aAAAeACa894E6d9683E0000007f')

    expect(() => {
      Address.collection.idToAddress(2 ** 32)
    }).toThrow()

    expect(Address.collection.addressToId('0x17c4E6453CC49AAAAEAca894E6D9683e000000fF'))
      .toBe(255)

    expect(() => {
      Address.collection.addressToId('0x17c4E6453CC49AAAAEAca894E6D9683e000000f')
    }).toThrow()
  })

  test.concurrent('Nesting address', () => {
    expect(Address.nesting.addressToIds('0xF8238cCfFf8Ed887463Fd5E00000000000000000'))
      .toEqual({collectionId: 0, tokenId: 0})

    expect(Address.nesting.addressToIds('0xF8238CCFfF8ed887463fd5E0000000fE0000007F'))
      .toEqual({collectionId: 254, tokenId: 127})

    expect(Address.nesting.addressToIds('0xF8238CcFFF8ed887463fD5E0fffffFFFFFfFFffF'))
      .toEqual({collectionId: 2 ** 32 - 1, tokenId: 2 ** 32 - 1})

    expect(() => {
      Address.nesting.addressToIds('0xF8238CCFfF8ed887463fd5E0000000fE0000007')
    })
      .toThrow()

    expect(Address.nesting.idsToAddress(0, 0))
      .toBe('0xF8238cCfFf8Ed887463Fd5E00000000000000000')

    expect(Address.nesting.idsToAddress(254, 127))
      .toBe('0xF8238CCFfF8ed887463fd5E0000000fE0000007F')

    expect(Address.nesting.idsToAddress(2 ** 32 - 1, 2 ** 32 - 1))
      .toBe('0xF8238CcFFF8ed887463fD5E0fffffFFFFFfFFffF')

    expect(() => {
      Address.nesting.idsToAddress(-1, 0)
    }).toThrow()
    expect(() => {
      Address.nesting.idsToAddress(2 ** 32, 0)
    }).toThrow()
    expect(() => {
      Address.nesting.idsToAddress(0, -1)
    }).toThrow()
    expect(() => {
      Address.nesting.idsToAddress(0, 2 ** 32)
    }).toThrow()
    expect(() => {
      Address.nesting.idsToAddress(-1, -1)
    }).toThrow()
    expect(() => {
      Address.nesting.idsToAddress(2 ** 32, 2 ** 32)
    }).toThrow()
  })

  test.concurrent('extract - address - substrate', () => {
    expect(Address.extract.address(quartz)).toEqual(quartz)
    expect(Address.extract.address({Substrate: quartz})).toEqual(quartz)
    expect(Address.extract.address({substrate: quartz})).toEqual(quartz)

    expect(Address.extract.addressNormalized(quartz)).toEqual(opal)
    expect(Address.extract.addressNormalized({Substrate: quartz})).toEqual(opal)
    expect(Address.extract.addressNormalized({substrate: quartz})).toEqual(opal)

    expect(Address.extract.addressNormalized(opal)).toEqual(opal)
    expect(Address.extract.addressNormalized({Substrate: opal})).toEqual(opal)
    expect(Address.extract.addressNormalized({substrate: opal})).toEqual(opal)

    expect(Address.extract.addressSafe(quartz)).toEqual(quartz)
    expect(Address.extract.addressSafe({Substrate: quartz})).toEqual(quartz)
    expect(Address.extract.addressSafe({substrate: quartz})).toEqual(quartz)

    expect(Address.extract.addressNormalizedSafe(quartz)).toEqual(opal)
    expect(Address.extract.addressNormalizedSafe({Substrate: quartz})).toEqual(opal)
    expect(Address.extract.addressNormalizedSafe({substrate: quartz})).toEqual(opal)

    expect(Address.extract.addressNormalizedSafe(opal)).toEqual(opal)
    expect(Address.extract.addressNormalizedSafe({Substrate: opal})).toEqual(opal)
    expect(Address.extract.addressNormalizedSafe({substrate: opal})).toEqual(opal)
  })

  test.concurrent('extract - address - ethereum', () => {
    expect(Address.extract.address(ethAddress)).toEqual(ethAddress)
    expect(Address.extract.address({Ethereum: ethAddress})).toEqual(ethAddress)
    expect(Address.extract.address({ethereum: ethAddress})).toEqual(ethAddress)

    expect(Address.extract.address(ethAddressLowercase)).toEqual(ethAddressLowercase)
    expect(Address.extract.address({Ethereum: ethAddressLowercase})).toEqual(ethAddressLowercase)
    expect(Address.extract.address({ethereum: ethAddressLowercase})).toEqual(ethAddressLowercase)

    expect(Address.extract.addressNormalized(ethAddressLowercase)).toEqual(ethAddress)
    expect(Address.extract.addressNormalized({Ethereum: ethAddressLowercase})).toEqual(ethAddress)
    expect(Address.extract.addressNormalized({ethereum: ethAddressLowercase})).toEqual(ethAddress)

    expect(Address.extract.addressSafe(ethAddress)).toEqual(ethAddress)
    expect(Address.extract.addressSafe({Ethereum: ethAddress})).toEqual(ethAddress)
    expect(Address.extract.addressSafe({ethereum: ethAddress})).toEqual(ethAddress)

    expect(Address.extract.addressNormalizedSafe(ethAddressLowercase)).toEqual(ethAddress)
    expect(Address.extract.addressNormalizedSafe({Ethereum: ethAddressLowercase})).toEqual(ethAddress)
    expect(Address.extract.addressNormalizedSafe({ethereum: ethAddressLowercase})).toEqual(ethAddress)
  })

  test.concurrent('extract - crossAccountId', () => {
    expect(Address.extract.crossAccountId(quartz)).toEqual({Substrate: quartz})
    expect(Address.extract.crossAccountId({Substrate: quartz})).toEqual({Substrate: quartz})
    expect(Address.extract.crossAccountId({substrate: quartz})).toEqual({Substrate: quartz})
    expect(Address.extract.crossAccountId(ethAddress)).toEqual({Ethereum: ethAddress})
    expect(Address.extract.crossAccountId({Ethereum: ethAddress})).toEqual({Ethereum: ethAddress})
    expect(Address.extract.crossAccountId({ethereum: ethAddress})).toEqual({Ethereum: ethAddress})
    expect(Address.extract.crossAccountId(ethAddressLowercase)).toEqual({Ethereum: ethAddressLowercase})
    expect(Address.extract.crossAccountId({Ethereum: ethAddressLowercase})).toEqual({Ethereum: ethAddressLowercase})
    expect(Address.extract.crossAccountId({ethereum: ethAddressLowercase})).toEqual({Ethereum: ethAddressLowercase})

    expect(Address.extract.crossAccountIdSafe(quartz)).toEqual({Substrate: quartz})
    expect(Address.extract.crossAccountIdSafe({Substrate: quartz})).toEqual({Substrate: quartz})
    expect(Address.extract.crossAccountIdSafe({substrate: quartz})).toEqual({Substrate: quartz})
    expect(Address.extract.crossAccountIdSafe(ethAddress)).toEqual({Ethereum: ethAddress})
    expect(Address.extract.crossAccountIdSafe({Ethereum: ethAddress})).toEqual({Ethereum: ethAddress})
    expect(Address.extract.crossAccountIdSafe({ethereum: ethAddress})).toEqual({Ethereum: ethAddress})
    expect(Address.extract.crossAccountIdSafe(ethAddressLowercase)).toEqual({Ethereum: ethAddressLowercase})
    expect(Address.extract.crossAccountIdSafe({Ethereum: ethAddressLowercase})).toEqual({Ethereum: ethAddressLowercase})
    expect(Address.extract.crossAccountIdSafe({ethereum: ethAddressLowercase})).toEqual({Ethereum: ethAddressLowercase})

    expect(Address.extract.crossAccountIdNormalized(quartz)).toEqual({Substrate: opal})
    expect(Address.extract.crossAccountIdNormalized({Substrate: quartz})).toEqual({Substrate: opal})
    expect(Address.extract.crossAccountIdNormalized({substrate: quartz})).toEqual({Substrate: opal})
    expect(Address.extract.crossAccountIdNormalized(ethAddressLowercase)).toEqual({Ethereum: ethAddress})
    expect(Address.extract.crossAccountIdNormalized({Ethereum: ethAddressLowercase})).toEqual({Ethereum: ethAddress})
    expect(Address.extract.crossAccountIdNormalized({ethereum: ethAddressLowercase})).toEqual({Ethereum: ethAddress})

    expect(Address.extract.crossAccountIdNormalizedSafe(quartz)).toEqual({Substrate: opal})
    expect(Address.extract.crossAccountIdNormalizedSafe({Substrate: quartz})).toEqual({Substrate: opal})
    expect(Address.extract.crossAccountIdNormalizedSafe({substrate: quartz})).toEqual({Substrate: opal})
    expect(Address.extract.crossAccountIdNormalizedSafe(ethAddressLowercase)).toEqual({Ethereum: ethAddress})
    expect(Address.extract.crossAccountIdNormalizedSafe({Ethereum: ethAddressLowercase})).toEqual({Ethereum: ethAddress})
    expect(Address.extract.crossAccountIdNormalizedSafe({ethereum: ethAddressLowercase})).toEqual({Ethereum: ethAddress})
  })

  test.concurrent('extract - crossAccountId', () => {
    expect(Address.extract.substrateOrMirrorIfEthereum(quartz)).toEqual(quartz)
    expect(Address.extract.substrateOrMirrorIfEthereum(ethAddress)).toEqual(subMirrorOfEthAddress)

    expect(Address.extract.substrateOrMirrorIfEthereumNormalized(quartz)).toEqual(opal)
    expect(Address.extract.substrateOrMirrorIfEthereumNormalized(ethAddress)).toEqual(subMirrorOfEthAddress)

    expect(Address.extract.substrateOrMirrorIfEthereumSafe(quartz)).toEqual(quartz)
    expect(Address.extract.substrateOrMirrorIfEthereumSafe(ethAddress)).toEqual(subMirrorOfEthAddress)

    expect(Address.extract.substrateOrMirrorIfEthereumNormalizedSafe(quartz)).toEqual(opal)
    expect(Address.extract.substrateOrMirrorIfEthereumNormalizedSafe(ethAddress)).toEqual(subMirrorOfEthAddress)
  })


  test.concurrent('extract - throws', () => {
    expect(() => {
      Address.extract.address(quartzMangled)
    }).toThrow()
    expect(() => {
      Address.extract.address({Substrate: quartzMangled})
    }).toThrow()
    expect(() => {
      Address.extract.address({Substrate: quartzMangled})
    }).toThrow()
    expect(() => {
      Address.extract.address({Substrate: ethAddress})
    }).toThrow()

    expect(() => {
      Address.extract.address(ethAddressMangled)
    }).toThrow()
    expect(() => {
      Address.extract.address({Ethereum: ethAddressMangled})
    }).toThrow()
    expect(() => {
      Address.extract.address({ethereum: ethAddressMangled})
    }).toThrow()

    expect(() => {
      Address.extract.address({Ethereum: quartz})
    }).toThrow()

    expect(() => {
      Address.extract.address(0 as any)
    }).toThrow()
    expect(() => {
      //@ts-ignore
      Address.extract.address()
    }).toThrow()

    expect(() => {
      Address.extract.address({} as any)
    }).toThrow()

    expect(() => {
      Address.extract.address('')
    }).toThrow()

    expect(() => {
      Address.extract.addressForScanNormalized(quartzMangled)
    }).toThrow()
    expect(() => {
      Address.extract.addressForScanNormalized(ethAddressMangled)
    }).toThrow()

    expect(() => {
      Address.extract.addressForScanNormalized(0 as any)
    }).toThrow()
    expect(() => {
      //@ts-ignore
      Address.extract.addressForScanNormalized()
    }).toThrow()

    expect(() => {
      Address.extract.addressForScanNormalized({} as any)
    }).toThrow()

    expect(() => {
      Address.extract.addressForScanNormalized('')
    }).toThrow()

    expect(Address.extract.addressNormalizedSafe({substrate: opal})).toEqual(opal)
    expect(Address.extract.addressSafe(quartzMangled)).toEqual(null)

    expect(Address.extract.addressSafe({})).toEqual(null)
    expect(Address.extract.addressSafe(0 as any)).toEqual(null)
    expect((Address.extract.addressSafe as any)()).toEqual(null)
    expect(Address.extract.crossAccountIdSafe({ethereum: quartz})).toEqual(null)

    expect(Address.extract.addressForScanNormalizedSafe(quartzMangled)).toEqual(null)
    expect(Address.extract.addressForScanNormalizedSafe(ethAddressMangled)).toEqual(null)
    expect(Address.extract.addressForScanNormalizedSafe(null as any)).toEqual(null)
    expect(Address.extract.addressForScanNormalizedSafe('')).toEqual(null)

    expect(Address.extract.addressForScanNormalized({substrate: quartz})).toEqual(opal)
    expect(Address.extract.addressForScanNormalized({Substrate: quartz})).toEqual(opal)
    expect(Address.extract.addressForScanNormalized(quartz)).toEqual(opal)
    expect(Address.extract.addressForScanNormalized({ethereum: ethAddress})).toEqual(ethAddressLowercase)
    expect(Address.extract.addressForScanNormalized({Ethereum: ethAddress})).toEqual(ethAddressLowercase)
    expect(Address.extract.addressForScanNormalized(ethAddress)).toEqual(ethAddressLowercase)
    expect(Address.extract.addressForScanNormalized({ethereum: ethAddressLowercase})).toEqual(ethAddressLowercase)

    expect(Address.extract.addressForScanNormalizedSafe({substrate: quartz})).toEqual(opal)
    expect(Address.extract.addressForScanNormalizedSafe({Substrate: quartz})).toEqual(opal)
    expect(Address.extract.addressForScanNormalizedSafe({ethereum: ethAddress})).toEqual(ethAddressLowercase)
    expect(Address.extract.addressForScanNormalizedSafe({Ethereum: ethAddress})).toEqual(ethAddressLowercase)
    expect(Address.extract.addressForScanNormalizedSafe(ethAddress)).toEqual(ethAddressLowercase)
    expect(Address.extract.addressForScanNormalizedSafe({ethereum: ethAddressLowercase})).toEqual(ethAddressLowercase)
    expect(Address.extract.addressForScanNormalizedSafe(quartz)).toEqual(opal)


  })
})
