export type SubAddressObj = { Substrate: string }
export type SubAddressObjUncapitalized = { substrate: string }
export type EthAddressObj = { Ethereum: string }
export type EthAddressObjUncapitalized = { ethereum: string }

export type CrossAccountId =
  SubAddressObj & { Ethereum?: never }
  |
  EthAddressObj & { Substrate?: never }

export type CrossAccountIdUncapitalized =
  SubAddressObjUncapitalized & { ethereum?: never }
  |
  EthAddressObjUncapitalized & { substrate?: never }

export type CrossAccountIdOrString = CrossAccountId | string
export type CrossAccountIdUncapitalizedOrString = CrossAccountIdUncapitalized | string
