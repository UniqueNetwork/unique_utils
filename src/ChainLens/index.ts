import {ChainLenses, generateChainLens} from './ChainLens'

const constants = {
  maxRefungiblePieces: 1000000000000000000000n,
  collectionCreationPrice: 2,
}

export {ChainLenses, constants, generateChainLens}
export default ChainLenses

export type {
  DecodedProperty,
  UNIQUE_CHAINS,
  IChainLens,
  INftToken,
  IRftToken,
  ICollection,
  CollectionType,
  DecodedPropertiesMap,
  DecodedCollectionLimits,
  CollectionLimits,
  CollectionEffectiveLimits,
  CollectionPermissions,
  TokenPropertyPermission,
  TokenPropertyPermissionValue,
} from './ChainLens'

