export enum RoyaltyType {
  DEFAULT = 'DEFAULT',
  PRIMARY_ONLY = 'PRIMARY_ONLY',
}

export interface UniqueRoyaltyPart {
  version: number
  royaltyType: RoyaltyType | `${RoyaltyType}`
  decimals: number
  value: bigint
  address: string
}

export type UniqueRoyaltyPartToEncode = {
  version?: number
  royaltyType?: RoyaltyType | `${RoyaltyType}`
  decimals?: number
  value: bigint
  address: string
}

export type RoyaltyAmount = {
  address: string
  amount: bigint
}

export type LibPart = {
  account: string
  value: bigint
}

export type IV2Royalty = {
  address: string,
  percent: number,
  isPrimaryOnly?: boolean,
}
