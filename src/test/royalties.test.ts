import {
  Royalties, RoyaltyType
} from '../Royalties'
import {
  ETH_DEFAULT,
  SUB_PRIMARY_ONLY,
  ROYALTY_ENCODED,
  ROYALTY_DECODED, UNIQUE_V2,
} from './royalties.samples'
import {describe, test, expect} from 'vitest'

describe('TS implementation', () => {
  describe('UniqueRoyaltyPart', () => {
    test('encode - sub - primary', () => {
      const encoded = Royalties.part.encode(SUB_PRIMARY_ONLY.decoded)
      expect(encoded).to.equal(SUB_PRIMARY_ONLY.encoded)
    })

    test('encode - eth - secondary', () => {
      const encoded = Royalties.part.encode(ETH_DEFAULT.decoded)
      expect(encoded).to.equal(ETH_DEFAULT.encoded)
    })

    test('decode - sub - primary', () => {
      const decoded = Royalties.part.decode(SUB_PRIMARY_ONLY.encoded)
      expect(decoded).toEqual(SUB_PRIMARY_ONLY.decoded)
    })

    test('decode - eth - secondary', () => {
      const decoded = Royalties.part.decode(ETH_DEFAULT.encoded)
      expect(decoded).toEqual(ETH_DEFAULT.decoded)
    })
  })

  describe('UniqueRoyalty', () => {
    test('encode', () => {
      const encoded = Royalties.encode(ROYALTY_DECODED)

      expect(encoded).to.equal(ROYALTY_ENCODED)
    })

    test('decode', () => {
      const decoded = Royalties.decode(ROYALTY_ENCODED)

      expect(decoded).to.deep.equal(ROYALTY_DECODED)
    })
  })

  describe('Calculate royalty', () => {
    test('should calculate royalty', () => {
      expect(
        Royalties.part.calculate(SUB_PRIMARY_ONLY.decoded, 1_000_000_000n).amount
      ).to.equal(25_500_000n)

      expect(Royalties.part.calculate({
        value: 1n,
        decimals: 0,
        address: '0x1234a38988dd5ecc93dd9ce90a44a00e5fb91e4c',
      }, 100n).amount).to.equal(100n)

      expect(Royalties.part.calculate({
        value: 100n,
        decimals: 0,
        address: '0x1234a38988dd5ecc93dd9ce90a44a00e5fb91e4c',
      }, 100n).amount).to.equal(10000n)

      expect(Royalties.part.calculate({
        value: 50n,
        decimals: 0,
        address: '0x1234a38988dd5ecc93dd9ce90a44a00e5fb91e4c',
      }, 100n).amount).to.equal(5000n)

      expect(Royalties.part.calculate({
        value: 1n,
        decimals: 6,
        address: '0x1234a38988dd5ecc93dd9ce90a44a00e5fb91e4c',
      }, 1_000_000_000n).amount).to.equal(1000n)

      expect(
        Royalties.part.calculate(SUB_PRIMARY_ONLY.decoded, 1_000_000_000_000n),
      ).to.deep.equal({
        address: SUB_PRIMARY_ONLY.decoded.address,
        amount: 255_000_00000n,
      })

      expect(
        Royalties.part.calculate(ETH_DEFAULT.decoded, 1_000_000_000_000n),
      ).to.deep.equal({
        address: ETH_DEFAULT.decoded.address,
        amount: 150_00000n,
      })
    })

    test('should calculate royalty depending on sale type', () => {
      const primary = Royalties.calculate(
        ROYALTY_DECODED,
        true,
        1_000_000_000_000n,
      )

      expect(primary.length).to.equal(1)
      expect(primary[0].address).to.equal(SUB_PRIMARY_ONLY.decoded.address)
      expect(primary[0].amount).to.equal(255_000_00000n)

      const secondary = Royalties.calculate(
        ROYALTY_DECODED,
        false,
        1_000_000_000_000n,
      )

      expect(secondary.length).to.equal(1)
      expect(secondary[0].address).to.equal(ETH_DEFAULT.decoded.address)
      expect(secondary[0].amount).to.equal(150_00000n)
    })
  })

  describe('validation', () => {
    test('should validate one part', () => {
      expect(Royalties.part.validate(SUB_PRIMARY_ONLY.decoded)).to.equal(true)
      expect(Royalties.part.validate(ETH_DEFAULT.decoded)).to.equal(true)
      expect(() => {
        Royalties.part.validate({
          ...SUB_PRIMARY_ONLY.decoded,
          value: 0n,
        })
      }).to.throw()
      expect(() => {
        Royalties.part.validate({
          ...SUB_PRIMARY_ONLY.decoded,
          address: '1',
        })
      }).to.throw()
    })

    test('should validate array', () => {
      expect(Royalties.validate(ROYALTY_DECODED)).to.equal(true)
      expect(() => {
        Royalties.validate([
          {
            ...SUB_PRIMARY_ONLY.decoded,
            value: 0n,
          },
        ])
      }).to.throw()
    })
  })

  describe('Unique Schema v2', () => {
    test('should encode royalties', () => {
      const royalties = Royalties.uniqueV2.encode(UNIQUE_V2.decoded)
      expect(royalties).to.equal(UNIQUE_V2.encoded)
    })

    test('should decode royalties', () => {
      const royalties = Royalties.uniqueV2.decode(UNIQUE_V2.encoded)
      expect(royalties).to.deep.equal(UNIQUE_V2.decoded)
    })
  })
})
