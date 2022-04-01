# KrakenDCA

This is a simple Node.js tool for buying a pre-allocated amount of assets from [Kraken](https://www.kraken.com/).  
There is also an optional integration for alerting with Telegram using [telegram bots](https://core.telegram.org/bots/api).  

## Configuration
Copy the `src/config.example.json` file to `src/config.json`  
```
Windows

copy src/config.example.json src/config.json

MacOS/Linux

cp src/config.example.json src/config.json
```
The config file uses the following format:  
   
`"fiatCurrency"`: 
- The currency used to buy your assets (e.g. "EUR", "USD", "CAD").   
- Must be supported by Kraken.  

`"fulfilMinOrder"`: 
- When a buy order is being calculated, KrakenDCA checks to see if the amount of fiat currency allocated will be enough to cover the minimum order size.   
- If this boolean is set to true, then KrakenDCA will spend extra fiat to cover the cost of the minimum order size.  
- If set to false, it just skips creationg a buy order for that asset.  

`"assets"`: 
- An array of the assets to buy, and how much fiat currency to allocate to buying them.  
- Each entry in this array should have the following fields:  
  - `"asset"`: The ticker or symbol of the asset to buy (e.g. "BTC","ETH","ALGO")  
  - `"amountInFiat"`: The amount of fiat currency to allocate to the purchase of this asset.  




## Usage 
Copy the `.env.example` file to `.env` and fill in the proper values 
```
Windows

copy .env.example .env

MacOS/Linux

cp .env.example .env
```
From here, you can either run the script directly or in a docker container (recommended)


- Run the application using Docker  
```
docker build -t <repo>/krakendca .

On Windows:

docker run -v %cd%/src/config.json:/usr/src/app/config.json --env-file=.env <repo>/krakendca

On MacOS/Linux:

docker run -v $(pwd)/src/config.json:/usr/src/app/config.json --env-file=.env <repo>/krakendca
```

- Run the application locally
```
source .env

npm i

cd src

node index.js
```
