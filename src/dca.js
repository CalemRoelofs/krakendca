const logger = require('./winston-setup');

const getLotPrecision = (unparsedInfo) => {
  const lotDecimals = unparsedInfo.lot_decimals;
  const lotMultiplier = unparsedInfo.lot_multiplier;
  return lotDecimals * lotMultiplier;
};

const getAssetPairInfo = async ({ client, asset, fiatCurrency }) => {
  const assetPairInfo = { asset, fiatCurrency };
  const pair = asset + fiatCurrency;
  logger.log('info', `Getting AssetPair info for ${pair}`);
  try {
    // check if in cache and if not:
    const res = await client.api('AssetPairs', { pair });
    const krakenPair = Object.keys(res.result)[0];
    const unparsedInfo = res.result[krakenPair];

    assetPairInfo.assetOrdermin = parseFloat(unparsedInfo.ordermin);
    assetPairInfo.lotPrecision = getLotPrecision(unparsedInfo);

    return assetPairInfo;
  } catch (err) {
    logger.log('error', `Error getting assetPairInfo: ${err}`);
    return 0;
  }
};

const getAskPrice = async ({ client, asset, fiatCurrency }) => {
  const pair = asset + fiatCurrency;
  logger.log('info', `Getting ask price for ${pair}`);
  try {
    const resp = await client.api('Ticker', { pair: asset + fiatCurrency });
    const krakenPair = Object.keys(resp.result)[0];
    return parseFloat(resp.result[krakenPair].a[0]);
  } catch (err) {
    logger.log('error', `Error getting askPrice:\n${err}`);
    return 0;
  }
};

const calculateAssetVolumeForOrder = ({
  assetOrdermin, fiatVolumeAllocated, askPrice, fiatCurrency, fulfilMinOrder = true,
}) => {
  logger.log('debug', 'Calculating minimum volume for order');
  logger.log('debug', `${fiatCurrency} ${fiatVolumeAllocated} allocated for this order`);
  const fiatOrderMin = askPrice * assetOrdermin;

  if (fiatOrderMin > fiatVolumeAllocated) {
    if (fulfilMinOrder) {
      logger.log(
        'debug',
        `Increasing allocated order volume to minimum order volume, will cost ${fiatCurrency} ${fiatOrderMin.toFixed(4)}`,
      );
      return assetOrdermin;
    }
    logger.log('debug', "Minimum order volume > allocated volume, won't purchase");
    return 0;
  }

  return fiatVolumeAllocated / askPrice;
};

const sendBuyOrder = async ({
  client, asset, fiatCurrency, volume, validate = true,
}) => {
  const pair = asset + fiatCurrency;
  logger.log('info', `Sending buy order for ${asset} ${volume}`);
  const options = {
    pair,
    volume,
    ordertype: 'market',
    type: 'buy',
    validate,
  };
  try {
    const resp = await client.api('AddOrder', options);
    return resp.result;
  } catch (err) {
    logger.log('error', `Error sending buyOrder:\n${err}`);
    return 0;
  }
};

module.exports = {
  getAssetPairInfo,
  getAskPrice,
  calculateAssetVolumeForOrder,
  sendBuyOrder,
};
