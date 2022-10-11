import {Address, StringUtils, CrossAccountIdUncapitalized, EnhancedCrossAccountId} from '../index'

type MakeFieldsNullable<Ob> = { [K in keyof Ob]: Ob[K] | null }

export enum UNIQUE_CHAINS {
  unique = 'unique',
  quartz = 'quartz',
  opal = 'opal',
  sapphire = 'sapphire',
  rc = 'rc',
}

const UNIQUE_RPCs: { [K in UNIQUE_CHAINS]: string } = {
  quartz: 'https://rpc-quartz.unique.network/',
  opal: 'https://rpc-opal.unique.network/',
  unique: 'https://rpc.unique.network/',
  sapphire: 'https://rpc-sapphire.unique.network/',
  rc: 'https://rpc-rc.unique.network/',
}

const requestRPC = async <T = any>(rpcUrl: string, method: string, params: unknown[]): Promise<T> => {
  const fetch = globalThis.fetch
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({jsonrpc: "2.0", id: 1, method, params}),
  })
  const result = await response.json()
  return result.result as T
}

export type TokenPropertyPermissionValue = {
  mutable: boolean
  collection_admin: boolean
  token_owner: boolean
}
export type TokenPropertyPermission = {
  key: string
  keyHex: string
  permission: TokenPropertyPermissionValue
}

const decodeTPPArray = (arr: Array<{ key: number[], permission: any }>): TokenPropertyPermission[] => {
  return arr.map(({key, permission}) => {
    return {
      key: StringUtils.Utf8.numberArrayToString(key),
      keyHex: StringUtils.HexString.fromArray(key),
      permission: permission as TokenPropertyPermissionValue,
    }
  })
}

export interface DecodedProperty {
  key: string
  value: string
  keyHex: string
  valueHex: string
}

export interface DecodedPropertyWithTokenPropertyPermission extends DecodedProperty {
  tokenPropertyPermission: TokenPropertyPermissionValue
}

export type DecodedPropertiesMap = Record<string, DecodedProperty>
export type DecodedPropertiesWithTokenPropertyPermissionsMap = Record<string, DecodedPropertyWithTokenPropertyPermission>

const decodeCollectionProperties = (arr: Array<{ key: number[], value: number[] }>): { properties: DecodedProperty[], propertiesMap: DecodedPropertiesMap } => {
  const properties: DecodedProperty[] = []
  const propertiesMap: Record<string, DecodedProperty> = {}

  for (const elem of arr) {
    const {key, value} = elem
    const decoded: DecodedProperty = {
      key: StringUtils.Utf8.numberArrayToString(key),
      keyHex: StringUtils.HexString.fromArray(key),
      value: StringUtils.Utf8.numberArrayToString(value),
      valueHex: StringUtils.HexString.fromArray(value),
    }
    properties.push(decoded)
    propertiesMap[decoded.key] = decoded
  }
  return {
    properties,
    propertiesMap,
  }
}

const decodeTokenProperties = (arr: Array<{ key: number[], value: number[] }>, tpps: TokenPropertyPermission[]): { properties: DecodedPropertyWithTokenPropertyPermission[], propertiesMap: DecodedPropertiesWithTokenPropertyPermissionsMap } => {
  const {properties, propertiesMap} = decodeCollectionProperties(arr) as {
    properties: DecodedPropertyWithTokenPropertyPermission[]
    propertiesMap: DecodedPropertiesWithTokenPropertyPermissionsMap
  }

  for (const property of properties) {
    const tppValue = tpps.find(tpp => tpp.keyHex === property.keyHex)!.permission
    property.tokenPropertyPermission = tppValue
    propertiesMap[property.key].tokenPropertyPermission = tppValue
  }

  return {
    properties,
    propertiesMap,
  }
}

export interface CollectionEffectiveLimits {                                  // default value
  account_token_ownership_limit: number                                // 100000
  owner_can_destroy: boolean                                           // true
  owner_can_transfer: boolean                                          // false
  sponsor_approve_timeout: number                                      // 5
  sponsor_transfer_timeout: number                                     // 5
  sponsored_data_rate_limit: 'SponsoringDisabled' | { Blocks: number } // "SponsoringDisabled"
  sponsored_data_size: number                                          // 2048
  token_limit: number                                                  // 4294967295
  transfers_enabled: boolean                                           // true
}

export type CollectionLimits = MakeFieldsNullable<CollectionEffectiveLimits>

export type DecodedCollectionLimits = {
  [K in keyof CollectionEffectiveLimits]: {
    key: K
    value: CollectionEffectiveLimits[K]
    isDefaultValue: boolean
  }
}

export interface CollectionPermissions {                                             // default value
  access: 'Normal' | 'AllowList'                                              // 'Normal'
  mint_mode: boolean                                                          // false
  nesting: {
    token_owner: boolean                                                      // false
    collection_admin: boolean                                                 // false
    restricted: null | number[]                                               // null
  }
}

export type CollectionType = 'NFT' | 'RFT' | 'FT'

export interface ICollection {
  collectionId: number
  collectionAddress: string
  owner: EnhancedCrossAccountId
  adminList: EnhancedCrossAccountId[]
  mode: 'NFT' | 'ReFungible' | { Fungible: number }
  name: string
  description: string
  tokenPrefix: string
  sponsorship: 'Disabled' | { Confirmed: string } | { Unconfirmed: string }
  decodedSponsorship: {
    enabled: boolean
    confirmed: boolean
    sponsor: EnhancedCrossAccountId | null
  }
  lastTokenId: number
  limits: CollectionLimits
  decodedLimits: DecodedCollectionLimits
  permissions: CollectionPermissions
  tokenPropertyPermissions: TokenPropertyPermission[]
  properties: DecodedProperty[]
  propertiesMap: DecodedPropertiesMap
  readOnly: boolean
  additionalInfo: {
    isNFT: boolean
    isRFT: boolean
    isFT: boolean
    type: CollectionType
  }
}

export interface INftToken {
  collectionId: number
  tokenId: number
  collectionAddress: string
  tokenAddress: string
  owner: EnhancedCrossAccountId

  properties: DecodedPropertyWithTokenPropertyPermission[]
  propertiesMap: DecodedPropertiesWithTokenPropertyPermissionsMap
}

export interface IRftToken {
  collectionId: number
  tokenId: number
  collectionAddress: string
  tokenAddress: string

  pieces: number

  owners: EnhancedCrossAccountId[]
  allOwnersAreKnown: boolean
  isOnlyOneOwner: boolean

  properties: DecodedPropertyWithTokenPropertyPermission[]
  propertiesMap: DecodedPropertiesWithTokenPropertyPermissionsMap
}


export const requestCollection = async (rpcUrl: string, collectionId: number, ss58Prefix: number): Promise<ICollection | null> => {
  const rawCollection = await requestRPC(rpcUrl, "unique_collectionById", [collectionId])
  if (!rawCollection) return null

  const {properties, propertiesMap} = decodeCollectionProperties(rawCollection.properties)

  const [
    adminListResult,
    effectiveLimits,
    lastTokenId,
  ] = await Promise.all([
    requestRPC(rpcUrl, "unique_adminlist", [collectionId]) as Promise<CrossAccountIdUncapitalized[]>,
    requestRPC(rpcUrl, 'unique_effectiveCollectionLimits', [collectionId]) as Promise<CollectionEffectiveLimits>,
    requestRPC(rpcUrl, 'unique_lastTokenId', [collectionId]) as Promise<number>,
  ])

  const adminList = adminListResult.map(crossAccountId => Address.extract.enhancedCrossAccountId(crossAccountId, ss58Prefix))

  const decodedLimits = Object.entries(effectiveLimits).reduce((acc, elem) => {
    const [key, value] = elem as [keyof CollectionEffectiveLimits, CollectionEffectiveLimits[keyof CollectionEffectiveLimits]]

    acc[key] = {
      key,
      value,
      isDefaultValue: rawCollection.limits[key] === null
    } as any

    return acc
  }, {} as DecodedCollectionLimits)

  const isNFT = rawCollection.mode === 'NFT'
  const isRFT = rawCollection.mode === 'ReFungible'
  const isFT = typeof rawCollection.mode === 'object' && typeof rawCollection.mode?.Fungible === 'number'

  const decodedSponsorship: ICollection['decodedSponsorship'] = {
    enabled: typeof rawCollection.sponsorship !== 'string',
    confirmed: !!rawCollection.sponsorship?.Confirmed,
    sponsor: typeof rawCollection.sponsorship === 'object' && !!rawCollection.sponsorship
      ? rawCollection.sponsorship.Confirmed
        ? Address.extract.enhancedCrossAccountId(rawCollection.sponsorship.Confirmed, ss58Prefix)
        : Address.extract.enhancedCrossAccountId(rawCollection.sponsorship.Unconfirmed, ss58Prefix)
      : null
  }

  const collection: ICollection = {
    collectionId,
    collectionAddress: Address.collection.idToAddress(collectionId),
    owner: Address.extract.enhancedCrossAccountId(rawCollection.owner, ss58Prefix),
    adminList,
    mode: rawCollection.mode,
    name: StringUtils.Utf16.numberArrayToString(rawCollection.name),
    description: StringUtils.Utf16.numberArrayToString(rawCollection.description),
    tokenPrefix: StringUtils.Utf8.numberArrayToString(rawCollection.token_prefix),
    sponsorship: rawCollection.sponsorship,
    decodedSponsorship,
    lastTokenId,
    limits: rawCollection.limits,
    decodedLimits,
    permissions: rawCollection.permissions,
    tokenPropertyPermissions: decodeTPPArray(rawCollection.token_property_permissions),
    properties,
    propertiesMap,
    readOnly: rawCollection.read_only as boolean,
    additionalInfo: {
      isNFT, isRFT, isFT,
      type: isRFT ? 'RFT' : isFT ? 'FT' : 'NFT'
    },
  }
  return collection
}

export const requestNftToken = async (rpcUrl: string, collectionId: number, tokenId: number, ss58Prefix: number): Promise<INftToken | null> => {
  const [rawCollection, rawToken] = await Promise.all([
    requestRPC(rpcUrl, "unique_collectionById", [collectionId]),
    requestRPC(rpcUrl, "unique_tokenData", [collectionId, tokenId]),
  ])

  if (!rawCollection || rawCollection.mode !== 'NFT' || !rawToken || !rawToken.owner) {
    return null
  }

  const {properties, propertiesMap} = decodeTokenProperties(
    rawToken.properties,
    decodeTPPArray(rawCollection.token_property_permissions)
  )

  const nftToken: INftToken = {
    collectionId,
    tokenId,
    collectionAddress: Address.collection.idToAddress(collectionId),
    tokenAddress: Address.nesting.idsToAddress(collectionId, tokenId),

    owner: Address.extract.enhancedCrossAccountId(rawToken.owner, ss58Prefix),

    properties,
    propertiesMap,
  }
  return nftToken
}


export const requestRftToken = async (rpcUrl: string, collectionId: number, tokenId: number, ss58Prefix: number): Promise<IRftToken | null> => {
  const [rawCollection, rawToken] = await Promise.all([
    requestRPC(rpcUrl, "unique_collectionById", [collectionId]),
    requestRPC(rpcUrl, "unique_tokenData", [collectionId, tokenId]),
  ])

  if (!rawCollection || rawCollection.mode !== 'ReFungible' || !rawToken || typeof rawToken.pieces !== 'number') { // protects from NFT/FT collections and from chains below 929030
    return null
  }

  let owners: EnhancedCrossAccountId[] = []
  let allOwnersAreKnown = true

  if (rawToken.owner) {
    owners = [Address.extract.enhancedCrossAccountId(rawToken.owner, ss58Prefix)]
  } else {
    owners = (await requestRPC<CrossAccountIdUncapitalized[]>(rpcUrl, 'unique_tokenOwners', [collectionId, tokenId]))
      .map(crossAccountId => Address.extract.enhancedCrossAccountId(crossAccountId, ss58Prefix))
    allOwnersAreKnown = owners.length < 10
  }

  const {properties, propertiesMap} = decodeTokenProperties(
    rawToken.properties,
    decodeTPPArray(rawCollection.token_property_permissions)
  )

  const rftToken: IRftToken = {
    collectionId,
    tokenId,
    collectionAddress: Address.collection.idToAddress(collectionId),
    tokenAddress: Address.nesting.idsToAddress(collectionId, tokenId),

    owners,
    allOwnersAreKnown,
    isOnlyOneOwner: !!rawToken.owner,

    pieces: rawToken.pieces,

    properties,
    propertiesMap,
  }
  return rftToken
}

const collectionIdOrAddressToCollectionId = (collectionIdOrAddress: number | string): number => {
  return typeof collectionIdOrAddress === 'string'
    ? Address.collection.addressToId(collectionIdOrAddress)
    : collectionIdOrAddress
}

export interface ChainDirectLightClientOptions {
  ss58Prefix: number
}

export const generateChainDirectLightClient = (rpcBaseUrl: string, options: ChainDirectLightClientOptions = {ss58Prefix: 42}) => {
  let rpcUrl = rpcBaseUrl

  const ss58Prefix = options.ss58Prefix

  return {
    get rpcUrl() {
      return rpcUrl
    },
    set rpcUrl(newRpcUrl: string) {
      rpcUrl = newRpcUrl
    },
    get ss58Prefix() {
      return ss58Prefix
    },

    requestRPC: async <T = any>(method: string, params: unknown[]): Promise<T> => {
      return requestRPC(rpcUrl, method, params)
    },
    requestCollection: async (collectionIdOrAddress: number | string) => {
      const collectionId = collectionIdOrAddressToCollectionId(collectionIdOrAddress)

      return requestCollection(rpcUrl, collectionId, ss58Prefix)
    },
    requestNftToken: async (collectionIdOrAddress: number | string, tokenId: number) => {
      const collectionId = collectionIdOrAddressToCollectionId(collectionIdOrAddress)

      return requestNftToken(rpcUrl, collectionId, tokenId, ss58Prefix)
    },
    requestNftTokenByAddress: async (tokenAddress: string) => {
      const {collectionId, tokenId} = Address.nesting.addressToIds(tokenAddress)

      return requestNftToken(rpcUrl, collectionId, tokenId, ss58Prefix)
    },

    requestRftToken: async (collectionIdOrAddress: number | string, tokenId: number) => {
      const collectionId = collectionIdOrAddressToCollectionId(collectionIdOrAddress)

      return requestRftToken(rpcUrl, collectionId, tokenId, ss58Prefix)
    },
    requestRftTokenByAddress: async (tokenAddress: string) => {
      const {collectionId, tokenId} = Address.nesting.addressToIds(tokenAddress)

      return requestRftToken(rpcUrl, collectionId, tokenId, ss58Prefix)
    },
  }
}

export type IChainDirectLightClient = ReturnType<typeof generateChainDirectLightClient>

export const ChainDirectLightClients: { [K in UNIQUE_CHAINS]: IChainDirectLightClient } = {
  unique: generateChainDirectLightClient(UNIQUE_RPCs.unique, {ss58Prefix: 7391}),
  quartz: generateChainDirectLightClient(UNIQUE_RPCs.quartz, {ss58Prefix: 255}),
  opal: generateChainDirectLightClient(UNIQUE_RPCs.opal, {ss58Prefix: 42}),
  sapphire: generateChainDirectLightClient(UNIQUE_RPCs.sapphire, {ss58Prefix: 8883}),
  rc: generateChainDirectLightClient(UNIQUE_RPCs.rc, {ss58Prefix: 42}),
}
