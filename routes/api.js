'use strict';

const fetch  = require('node-fetch');
const { response } = require('../server');

module.exports = function (app, collection) {

  app.route('/api/stock-prices')
    .get(async function (req, res){
      let stocks = await req.query.stock
      if (typeof stocks === 'string'){
        const resp1 = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stocks}/quote`)
        const stock1 = await resp1.json()
        const stockData = {
            stock: stock1.symbol,
            price: stock1.latestPrice
          }
        res.send({stockData: stockData})
      }
      else if(stocks.length === 2){
        if(stocks[1].length!== 4 || stocks[0].length!==4) return res.send({error: 'Invalid stocks'})
        const resp1 = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stocks[0]}/quote`)
        const resp2 = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stocks[1]}/quote`)
        const stock1 = await resp1.json()
        const stock2 = await resp2.json()
        const stockData1 = {
          stock: stock1.symbol,
          price: stock1.latestPrice
        }
        const stockData2 = {
          stock: stock2.symbol,
          price: stock2.latestPrice
        }
        const stockData = [stockData1, stockData2]
        res.send({stockData: stockData})
      }
      else{
        res.send({error: 'Invalid stocks'})
      }
    });
    
};
