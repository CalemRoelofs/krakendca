const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const KrakenClient = require('kraken-api');
const dca = require('./dca');
const logger = require('./winston-setup');

const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramChatId = process.env.TELEGRAM_CHAT_ID;
const telegramBot = new TelegramBot(telegramBotToken, { polling: false });
const key = process.env.KRAKEN_API_KEY;
const secret = process.env.KRAKEN_API_SECRET;
const validateTransactionOnly = (process.env.VALIDATE_TRANSACTION_ONLY === 'true');
const client = new KrakenClient(key, secret);
const config = JSON.parse(fs.readFileSync('config.json'));

const sendUpdateToTelegram = async (message) => telegramBot.sendMessage(telegramChatId, message);

(async () => {
  logger.log('info', 'Starting KrakenDCA');
  sendUpdateToTelegram('Starting KrakenDCA');

  try {
    const startingBalance = await client.api('Balance');
    const startingBalanceString = JSON.stringify(startingBalance.result, null, '  ');
    logger.log('info', `Current balance is: ${startingBalanceString}`);
  } catch (err) {
    logger.log('error', `Error getting start balance: ${err}`);
    process.exit(1);
  }

  const { fiatCurrency, fulfilMinOrder, assets } = config;

  for (const a of assets) {
    const { amountInFiat, asset } = a;
    logger.log('info', `Processing order for ${config.fiatCurrency} ${amountInFiat} worth of ${asset}`);
    try {
      const { assetOrdermin, lotPrecision } = await dca.getAssetPairInfo(
        { client, asset, fiatCurrency },
      );

      const askPrice = await dca.getAskPrice({ client, asset, fiatCurrency });

      const fiatOrdermin = (askPrice * assetOrdermin);
      logger.log('debug', `${asset + fiatCurrency} | AskPrice=${askPrice} | MinOrder(Asset)=${assetOrdermin} | MinOrder(Fiat)=${fiatOrdermin.toFixed(4)}`);

      const orderAssetVolume = dca.calculateAssetVolumeForOrder({
        assetOrdermin, fiatVolumeAllocated: amountInFiat, askPrice, fiatCurrency, fulfilMinOrder,
      });
      if (orderAssetVolume <= 0) {
        logger.log('error', `AssetOrderMin came back as 0, will not purchase ${asset}`);
      }

      const orderAssetVolumeFixed = orderAssetVolume.toFixed(lotPrecision);

      logger.log('info', `Proceeding to buy ${asset} ${orderAssetVolumeFixed} @ ${fiatCurrency} ${askPrice}`);
      const buyResult = await dca.sendBuyOrder({
        client,
        asset,
        fiatCurrency,
        volume: orderAssetVolumeFixed,
        validate: validateTransactionOnly,
      });
      logger.log('info', JSON.stringify(buyResult));

      continue;
    } catch (err) {
      logger.log('error', `Could not complete purchase of ${asset}! ${err}`);
      sendUpdateToTelegram(`Could not complete purchase of ${asset}! ${err}`);
      continue;
    }
  }

  // Wait 30 seconds for orders to go through
  if (!validateTransactionOnly) await new Promise((resolve) => { setTimeout(resolve, 30000); });

  const newBalance = await client.api('Balance');
  const newBalanceString = JSON.stringify(newBalance.result, null, '  ');
  logger.log('info', `All finished, new balance: ${newBalanceString}`);

  sendUpdateToTelegram(`All finished, new balance: ${newBalanceString}`);
})();
