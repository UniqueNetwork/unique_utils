import {describe, expect, test} from 'vitest'
import {Coin, CoinUtils} from 'src'

const {
  coinsToWei,
  coinsToWeiInBigInt,
  dangerouslyWeiToCoinsInFloat,
  formatMetric,
  weiToCoins, weiToCoinsMetric
} = CoinUtils

describe('Utils - coins', () => {
  test('coinsToWei', () => {
    expect(coinsToWei('1')).to.equal('1000000000000000000')
    expect(coinsToWei('0.000000000000000001')).to.equal('1')
    expect(coinsToWeiInBigInt('0.0000000000000001')).to.equal(100n)
    expect(coinsToWei('1000000000000000000')).to.equal('1000000000000000000000000000000000000')
    expect(coinsToWeiInBigInt('1000000000000000000')).to.equal(1000000000000000000000000000000000000n)

    expect(() => coinsToWei('-1')).to.throw()
    expect(() => coinsToWei('')).to.throw()
    expect(() => coinsToWei('abc')).to.throw()
  })

  test('coinsToWei - decimals', () => {
    expect(coinsToWei('1', 12)).to.equal('1000000000000')
    expect(coinsToWei('1.1', 12)).to.equal('1100000000000')
    expect(coinsToWeiInBigInt('1.123456789', 12)).to.equal(1123456789000n)
    expect(coinsToWeiInBigInt('0.0000000001', 12)).to.equal(100n)

    expect(() => coinsToWei('1', 'abc' as any)).to.throw('must be a number')
    expect(() => coinsToWei('1', -1)).to.throw('between 0 and 18')
    expect(() => coinsToWei('1', 0)).to.throw('between 0 and 18')
    expect(() => coinsToWei('1', 19)).to.throw('between 0 and 18')
  })

  test('weiToCoins', () => {
    expect(weiToCoins('1000000000000000000')).to.equal('1')
    expect(weiToCoins('100000000000000000')).to.equal('0.1')
    expect(weiToCoins('1100000000000000000')).to.equal('1.1')
  })

  test('weiToCoins - decimals', () => {
    expect(weiToCoins('1000000000000', 12)).to.equal('1')
    expect(weiToCoins('100000000000', 12)).to.equal('0.1')
    expect(weiToCoins('1100000000000', 12)).to.equal('1.1')

    expect(() => weiToCoins('1', 'abc' as any)).to.throw('must be a number')
    expect(() => weiToCoins('1', -1)).to.throw('between 0 and 18')
    expect(() => weiToCoins('1', 0)).to.throw('between 0 and 18')
    expect(() => weiToCoins('1', 19)).to.throw('between 0 and 18')
  })

  // not sure that this test will work and will work same in different environments
  test('dangerouslyWeiToCoinsInFloat', () => {
    expect(dangerouslyWeiToCoinsInFloat('1000000000000000000')).to.equal(1)
    expect(dangerouslyWeiToCoinsInFloat('100000000000000000')).to.equal(0.1)
    expect(dangerouslyWeiToCoinsInFloat('1100000000000000000')).to.equal(1.1)
    expect(dangerouslyWeiToCoinsInFloat('300000000000000000')).to.equal(0.3)
    expect(dangerouslyWeiToCoinsInFloat('10000000450000000000000000')).to.equal(10000000.45)
    expect(dangerouslyWeiToCoinsInFloat('000000000000000001')).to.equal(1e-18)
  })

  test('formatWithMetricSuffix', () => {
    expect(formatMetric('1532900')).to.equal('1.533M')
    expect(formatMetric('1000')).to.equal('1K')
    expect(formatMetric('987654321')).to.equal('987.654M')

    expect(formatMetric('1532900', 'UNQ')).to.equal('1.533M UNQ')
    expect(formatMetric('1000', 'QTZ')).to.equal('1K QTZ')
    expect(formatMetric('987654321', 'OPL')).to.equal('987.654M OPL')
    expect(formatMetric('0')).to.equal('0')
    expect(formatMetric('0', 'Eth')).to.equal('0 Eth')
  })

  test('weiToCoinsWithMetricSuffix', () => {
    expect(weiToCoinsMetric('1532900000000000000000000')).to.equal('1.533M')
    expect(weiToCoinsMetric('1199999000000000000000', '', 12)).to.equal('1.2B')
    expect(weiToCoinsMetric('1199999000000000000000', 'OPL')).to.equal('1.2K OPL')
    expect(weiToCoinsMetric('1000000000000000', 'OPL', 12)).to.equal('1K OPL')
    expect(weiToCoinsMetric('1000000000000000', 'OPL', 6)).to.equal('1B OPL')
    expect(weiToCoinsMetric('1000000000000000', 'OPL', 3)).to.equal('1T OPL')
    expect(weiToCoinsMetric('1000000000000000', 'OPL', 1)).to.equal('100T OPL')
  })

  test('Coin pseudo-class', () => {
    const opl = Coin('OPL')

    // basic methods
    expect(opl.coinsToWeiInBigInt('1')).to.equal(1000000000000000000n)
    expect(opl.coinsToWei('1')).to.equal('1000000000000000000')
    expect(opl.weiToCoins('1100000000000000000')).to.equal('1.1')
    expect(opl.dangerouslyWeiToCoinsInFloat('1100000000000000000')).to.equal(1.1)

    // currency and decimals specific methods
    expect(opl.weiToCoinsMetric('1199400000000000000000')).to.equal('1.199K OPL')
    expect(opl.weiToCoinsMetric('1199500000000000000000')).to.equal('1.2K OPL')
    expect(opl.formatMetric('1199.9')).to.equal('1.2K OPL')

    // with currency and decimals
    const unq = Coin('UNQ', 12)
    expect(unq.formatMetric('1199.9')).to.equal('1.2K UNQ')
    expect(unq.weiToCoinsMetric('1199400000000000000000')).to.equal('1.199B UNQ')
    expect(unq.weiToCoinsMetric('1199400000000000')).to.equal('1.199K UNQ')
    expect(unq.weiToCoinsMetric('1199500000000000')).to.equal('1.2K UNQ')
    expect(unq.weiToCoinsMetric('1199500000000000000000')).to.equal('1.2B UNQ')

    // empty currency, default decimals
    const empty = Coin('')
    expect(empty.formatMetric('1199.9')).to.equal('1.2K')
    expect(empty.weiToCoinsMetric('1199400000000000000000')).to.equal('1.199K')
    expect(empty.weiToCoinsMetric('1199500000000000000000')).to.equal('1.2K')

    // without currency, specific decimals
    const empty12 = Coin('', 12)
    expect(empty12.formatMetric('1199.9')).to.equal('1.2K')
    expect(empty12.weiToCoinsMetric('1199400000000000000000')).to.equal('1.199B')
    expect(empty12.weiToCoinsMetric('1199400000000000')).to.equal('1.199K')
    expect(empty12.weiToCoinsMetric('1199500000000000')).to.equal('1.2K')
    expect(empty12.weiToCoinsMetric('1199500000000000000000')).to.equal('1.2B')
  })
})
