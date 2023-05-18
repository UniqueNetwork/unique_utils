export type SubAddressObj = { Substrate: string }
export type SubAddressObjUncapitalized = { substrate: string }
export type EthAddressObj = { Ethereum: string }
export type EthAddressObjUncapitalized = { ethereum: string }

export type CrossAccountId =
  SubAddressObj & { Ethereum?: never }
  |
  EthAddressObj & { Substrate?: never }

export type AddressType = 'Ethereum' | 'Substrate'

export type EnhancedCrossAccountId = CrossAccountId & {
  address: string
  addressSS58: string
  type: AddressType
  isEthereum: boolean
  isSubstrate: boolean
  substratePublicKey: string
}


export type CrossAccountIdUncapitalized =
  SubAddressObjUncapitalized & { ethereum?: never }
  |
  EthAddressObjUncapitalized & { substrate?: never }

export type CrossAccountIdOrString = CrossAccountId | string
export type CrossAccountIdUncapitalizedOrString = CrossAccountIdUncapitalized | string

export type EthCrossAccountId = {eth: string, sub: string}
