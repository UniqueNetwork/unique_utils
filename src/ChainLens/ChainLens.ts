import {Address, CrossAccountIdUncapitalized, EnhancedCrossAccountId} from '../index'

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

type RequestRPC = <T = any>(method: string, params: unknown[]) => Promise<T>

const requestRPCFactory = (rpcUrl: string): RequestRPC => async (method, params) => {
  const fetch = globalThis.fetch
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({jsonrpc: "2.0", id: 1, method, params}),
  })
  const result = await response.json()
  return result.result
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


const decodeUtf8 = (arr: number[] | Uint8Array): string => {
  const utf8 = new Uint8Array(arr)
  const decoder = new TextDecoder('utf-8')
  return decoder.decode(utf8)
}

const decodeUtf16 = (arr: number[] | Uint16Array): string => {
  const utf16 = new Uint16Array(arr)
  const decoder = new TextDecoder('utf-16le')
  return decoder.decode(utf16)
}

const arrayToHex = (arr: number[] | Uint8Array): string => {
  return '0x' + Array.from(arr)
    .map(num => num.toString(16).padStart(2, '0'))
    .join('')
}


const decodeTPPArray = (arr: Array<{ key: number[], permission: any }>): TokenPropertyPermission[] => {
  return arr.map(({key, permission}) => {
    return {
      key: decodeUtf8(key),
      keyHex: arrayToHex(key),
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
      key: decodeUtf8(key),
      keyHex: arrayToHex(key),
      value: decodeUtf8(value),
      valueHex: arrayToHex(value),
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
  flags?: {foreign: boolean, erc721metadata: boolean}
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


export const requestCollection = async (requestRPC: RequestRPC, collectionId: number, ss58Prefix: number): Promise<ICollection | null> => {
  const rawCollection = await requestRPC("unique_collectionById", [collectionId])
  if (!rawCollection) return null

  const {properties, propertiesMap} = decodeCollectionProperties(rawCollection.properties)

  const [
    adminListResult,
    effectiveLimits,
    lastTokenId,
  ] = await Promise.all([
    requestRPC('unique_adminlist', [collectionId]) as Promise<CrossAccountIdUncapitalized[]>,
    requestRPC('unique_effectiveCollectionLimits', [collectionId]) as Promise<CollectionEffectiveLimits>,
    requestRPC('unique_lastTokenId', [collectionId]) as Promise<number>,
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
    ...rawCollection,
    collectionId,
    collectionAddress: Address.collection.idToAddress(collectionId),
    owner: Address.extract.enhancedCrossAccountId(rawCollection.owner, ss58Prefix),
    adminList,
    mode: rawCollection.mode,
    name: decodeUtf16(rawCollection.name),
    description: decodeUtf16(rawCollection.description),
    tokenPrefix: decodeUtf8(rawCollection.token_prefix),
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
    flags: rawCollection.flags || undefined
  }
  return collection
}

export const requestNftToken = async (requestRPC: RequestRPC, collectionId: number, tokenId: number, ss58Prefix: number): Promise<INftToken | null> => {
  const [rawCollection, rawToken] = await Promise.all([
    requestRPC("unique_collectionById", [collectionId]),
    requestRPC("unique_tokenData", [collectionId, tokenId]),
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


export const requestRftToken = async (requestRPC: RequestRPC, collectionId: number, tokenId: number, ss58Prefix: number): Promise<IRftToken | null> => {
  const [rawCollection, rawToken] = await Promise.all([
    requestRPC("unique_collectionById", [collectionId]),
    requestRPC("unique_tokenData", [collectionId, tokenId]),
  ])

  if (!rawCollection || rawCollection.mode !== 'ReFungible' || !rawToken || typeof rawToken.pieces !== 'number') { // protects from NFT/FT collections and from chains below 929030
    return null
  }

  let owners: EnhancedCrossAccountId[] = []
  let allOwnersAreKnown = true

  if (rawToken.owner) {
    owners = [Address.extract.enhancedCrossAccountId(rawToken.owner, ss58Prefix)]
  } else {
    owners = (await requestRPC<CrossAccountIdUncapitalized[]>('unique_tokenOwners', [collectionId, tokenId]))
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

export interface ChainLensOptions {
  ss58Prefix: number
}

export const generateChainLens = (rpcBaseUrlOrRequestRPC: string | RequestRPC, options: ChainLensOptions = {ss58Prefix: 42}) => {
  const requestRPC = typeof rpcBaseUrlOrRequestRPC === 'string' ? requestRPCFactory(rpcBaseUrlOrRequestRPC) : rpcBaseUrlOrRequestRPC

  const ss58Prefix = options.ss58Prefix

  return {
    get ss58Prefix() {
      return ss58Prefix
    },
    requestRPC: async <T = any>(method: string, params: unknown[]): Promise<T> => {
      return requestRPC(method, params)
    },
    requestCollection: async (collectionIdOrAddress: number | string) => {
      const collectionId = collectionIdOrAddressToCollectionId(collectionIdOrAddress)

      return requestCollection(requestRPC, collectionId, ss58Prefix)
    },
    requestNftToken: async (collectionIdOrAddress: number | string, tokenId: number) => {
      const collectionId = collectionIdOrAddressToCollectionId(collectionIdOrAddress)

      return requestNftToken(requestRPC, collectionId, tokenId, ss58Prefix)
    },
    requestNftTokenByAddress: async (tokenAddress: string) => {
      const {collectionId, tokenId} = Address.nesting.addressToIds(tokenAddress)

      return requestNftToken(requestRPC, collectionId, tokenId, ss58Prefix)
    },
    requestRftToken: async (collectionIdOrAddress: number | string, tokenId: number) => {
      const collectionId = collectionIdOrAddressToCollectionId(collectionIdOrAddress)

      return requestRftToken(requestRPC, collectionId, tokenId, ss58Prefix)
    },
    requestRftTokenByAddress: async (tokenAddress: string) => {
      const {collectionId, tokenId} = Address.nesting.addressToIds(tokenAddress)

      return requestRftToken(requestRPC, collectionId, tokenId, ss58Prefix)
    },
  }
}

export type IChainLens = ReturnType<typeof generateChainLens>

export const ChainLenses: { [K in UNIQUE_CHAINS]: IChainLens } = {
  unique: generateChainLens(UNIQUE_RPCs.unique, {ss58Prefix: 7391}),
  quartz: generateChainLens(UNIQUE_RPCs.quartz, {ss58Prefix: 255}),
  opal: generateChainLens(UNIQUE_RPCs.opal, {ss58Prefix: 42}),
  sapphire: generateChainLens(UNIQUE_RPCs.sapphire, {ss58Prefix: 8883}),
  rc: generateChainLens(UNIQUE_RPCs.rc, {ss58Prefix: 42}),
}
