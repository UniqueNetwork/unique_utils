import {UniqueRoyaltyPart, RoyaltyType, IV2Royalty} from '../Royalties'

type Sample = {
  decoded: UniqueRoyaltyPart
  encoded: string
}

export const SUB_PRIMARY_ONLY = {
  decoded: {
    version: 1,
    decimals: 4,
    value: 255n,
    royaltyType: RoyaltyType.PRIMARY_ONLY,
    address: '5D7WxWqqUYNm962RUNdf1UTCcuasXCigHFMGG4hWX6hkp7zU',
  },
  encoded:
    '0x' +
    '01000000000000000000000000000000000000000000110400000000000000ff' +
    '2e61479a581f023808aaa5f2ec90be6c2b250102d99d788bde3c8d4153a0ed08',
} satisfies Sample

export const ETH_DEFAULT = {
  decoded: {
    version: 1,
    decimals: 6,
    value: 15n,
    royaltyType: RoyaltyType.DEFAULT,
    address: '0xcafe52dae8874E9E6d7511e05d213590E47e97B6',
  },
  encoded:
    '0x' +
    '010000000000000000000000000000000000000000000006000000000000000f' +
    '000000000000000000000000cafe52dae8874e9e6d7511e05d213590e47e97b6',
} satisfies Sample

export const ROYALTY_ENCODED =
  SUB_PRIMARY_ONLY.encoded + ETH_DEFAULT.encoded.slice(2)

export const ROYALTY_DECODED = [SUB_PRIMARY_ONLY.decoded, ETH_DEFAULT.decoded]
