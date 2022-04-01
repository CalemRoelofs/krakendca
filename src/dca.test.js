/* eslint-disable no-undef */
const KrakenClient = require('kraken-api');
const dca = require('./dca');

const client = new KrakenClient('key', 'secret');

afterAll(() => {
  jest.restoreAllMocks();
});

describe('getAssetPairInfo', () => {
  test('should return assetPairInfo', async () => {
    // Given
    const mockResponse = {
      result: {
        BTCEUR: {
          ordermin: '0.0001',
          lot_decimals: 8,
          lot_multiplier: 1,
        },
      },
    };
    const spy = jest.spyOn(client, 'api').mockImplementation(() => mockResponse);

    // When
    const res = await dca.getAssetPairInfo({ client, asset: 'BTC', fiatCurrency: 'EUR' });

    // Then
    expect(spy).toHaveBeenCalled();
    expect(res.assetOrdermin).toEqual(0.0001);
    expect(res.lotPrecision).toEqual(8);
  });
});

describe('getAskPrice', () => {
  test('should return askPrice', async () => {
    // Given
    const mockResponse = {
      result: {
        BTCEUR: {
          a: ['10000.00'],
        },
      },
    };
    const spy = jest.spyOn(client, 'api').mockImplementation(() => mockResponse);

    // When
    const res = await dca.getAskPrice({ client, asset: 'BTC', fiatCurrency: 'EUR' });

    // Then
    expect(spy).toHaveBeenCalled();
    expect(res).toEqual(10000.00);
  });
});

describe('calculateMinVolumeForOrder', () => {
  it.each`
    assetOrdermin | fiatVolumeAllocated | askPrice | fulfilMinOrder | expected
    ${0.1}        | ${10}               | ${10}    | ${true}        | ${1}
    ${0.1}        | ${10}               | ${100}   | ${true}        | ${0.1}
    ${0.1}        | ${10}               | ${1000}  | ${true}        | ${0.1}
    ${0.1}        | ${10}               | ${10000} | ${true}        | ${0.1}
    ${0.1}        | ${10}               | ${10}    | ${false}       | ${1}
    ${0.1}        | ${10}               | ${100}   | ${false}       | ${0.1}
    ${0.1}        | ${10}               | ${1000}  | ${false}       | ${0}
    ${0.1}        | ${10}               | ${10000} | ${false}       | ${0}
    `(
    "should return '$expected' if fulfilMinOrder = '$fulfilMinOrder'",
    async ({
      assetOrdermin, fiatVolumeAllocated, askPrice, fulfilMinOrder, expected,
    }) => {
      // Given
      const args = {
        assetOrdermin,
        fiatVolumeAllocated,
        askPrice,
        fiatCurrency: 'EUR',
        fulfilMinOrder,
      };

      // When
      const res = await dca.calculateAssetVolumeForOrder(args);

      // Then
      expect(res).toEqual(expected);
    },
  );
});

describe('sendBuyOrder', () => {
  test('should return orderInfo', async () => {
    // Given
    const mockResponse = { result: { descr: { order: 'buy 10.00000000 BTC @ market' } } };
    const spy = jest.spyOn(client, 'api').mockImplementation(() => mockResponse);
    const args = {
      client,
      asset: 'BTC',
      fiatCurrency: 'EUR',
      volume: 10,
    };

    // When
    const res = await dca.sendBuyOrder(args);

    // Then
    expect(spy).toHaveBeenCalled();
    expect(res.descr.order).toEqual('buy 10.00000000 BTC @ market');
  });
});
