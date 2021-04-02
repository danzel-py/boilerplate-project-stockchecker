'use strict';

const e = require('express');
const fetch = require('node-fetch');
const {
  response
} = require('../server');

module.exports = function (app, collection) {

  app.route('/api/stock-prices')
    .get(async function (req, res) {
      let stocks = req.query.stock
      let likeBoolean = req.query.like
      console.log(req.ip)
      if (typeof stocks === 'string' || stocks.length === 2) {
        // case: only 1 stock
        if (typeof stocks === 'string') {
          if (stocks.length !== 4) return res.send({error: 'Invalid stocks'})
          const resp1 = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stocks}/quote`)
          const stock1 = await resp1.json()
          if(stock1 === 'Unknown symbol'){
            return res.send({error: 'Invalid stocks'})
          }
          var stockName1 = stock1.symbol
          var stockData = {
            stock: stock1.symbol,
            price: stock1.latestPrice
          }
        }
        if (likeBoolean === true){
          
        }




        // case: 2 stocks
        else if(stocks.length === 2) {
          if (stocks[1].length !== 4 || stocks[0].length !== 4) return res.send({
            error: 'Invalid stocks'
          })
          const resp1 = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stocks[0]}/quote`)
          const resp2 = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stocks[1]}/quote`)
          const stock1 = await resp1.json()
          const stock2 = await resp2.json()
          if(stock1 === 'Unknown symbol'|| stock2 === 'Unknown symbol'){
            return res.send({error: 'Invalid stocks'})
          }
          const stockData1 = {
            stock: stock1.symbol,
            price: stock1.latestPrice
          }
          const stockData2 = {
            stock: stock2.symbol,
            price: stock2.latestPrice
          }
          var stockName1 = stock1.symbol
          var stockName2 = stock2.symbol
          var stockData = [stockData1, stockData2]
        }
        else{
          return res.send('Internal/input error')
        }
        // after the fetch thingy

        // handling likes

        if (likeBoolean === 'true'){

          
        }
        else{
          // do nothing
        }




        // send response
        res.send({
          stockData: stockData
        })

      } 

      // invalid stocks
      else {
        res.send({
          error: 'Invalid stocks'
        })
      }
    });

};