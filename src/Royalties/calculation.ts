import {RoyaltyAmount, RoyaltyType, UniqueRoyaltyPartToEncode} from './types'
import {parseRoyaltyPart} from './utils'

export const calculateRoyaltyPart = (
  part: UniqueRoyaltyPartToEncode,
  sellPrice: bigint,
): RoyaltyAmount => {
  const royalty = parseRoyaltyPart(part)
  return {
    address: royalty.address,
    amount: (sellPrice * royalty.value) / 10n ** BigInt(royalty.decimals),
  }
}

export const calculateRoyalties = (
  royalties: UniqueRoyaltyPartToEncode[],
  isPrimarySale: boolean,
  sellPrice: bigint,
): RoyaltyAmount[] => {
  return royalties
    .filter(
      (r) => isPrimarySale === (r.royaltyType === RoyaltyType.PRIMARY_ONLY),
    )
    .map((r) => calculateRoyaltyPart(r, sellPrice))
}
