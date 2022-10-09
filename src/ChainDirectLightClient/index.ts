import {ChainDirectLightClients, generateChainDirectLightClient} from './ChainDirectLightClient'

const constants = {
  maxRefungiblePieces: 1000000000000000000000n,
  collectionCreationPrice: 2,
}

export {ChainDirectLightClients, constants, generateChainDirectLightClient}
export default ChainDirectLightClients

export type {
  DecodedProperty,
  UNIQUE_CHAINS,
  IChainDirectLightClient,
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
} from './ChainDirectLightClient'

