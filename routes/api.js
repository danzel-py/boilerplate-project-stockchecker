'use strict';

const e = require('express');
const fetch = require('node-fetch');
const {
  response
} = require('../server');

function sendRes(stock1,likeCount,res){
  var stockData = {
    stock: stock1.symbol,
    price: stock1.latestPrice,
    likes: likeCount
  }
  res.send({
    stockData: stockData
  })
}

module.exports = function (app, collection) {

  app.route('/api/stock-prices')
    .get(async function (req, res) {
      let stocks = req.query.stock
      let getIp = await fetch('https://api64.ipify.org?format=json')
      let ip = await getIp.json()
      let clientAddress = ip.ip
      let like = req.query.like
      let likeCount

      if (typeof stocks === 'string' || stocks.length === 2) {

        // case: only 1 stock

        if (typeof stocks === 'string') {
          if (stocks.length !== 4) return res.send({
            error: 'Invalid stocks'
          })
          const resp1 = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stocks}/quote`)
          const stock1 = await resp1.json()
          if (stock1 === 'Unknown symbol') {
            return res.send({
              error: 'Invalid stocks'
            })
          }
          var stockName1 = stock1.symbol
          
          // handling likes

          await collection.findOne({ symbol: stockName1 }, (err, data) => {
            if (err) return console.log(err)
            // case symbol not found
            if (!data) {
              // insert symbol
              collection.insertOne({ symbol: stockName1, likedBy: [] }, (err, data) => {
                if (err) return console.log(err)
                // if like is true push address to likedBy array
                if (like == 'true') {
                  collection.updateOne({ symbol: stockName1 }, {
                    $push: { likedBy:  clientAddress  }
                  })
                  // initiate likeCount
                  likeCount = Number(1)
                  sendRes(stock1,likeCount,res)
                  
                }
                // if like is not true
                else{
                  likeCount = Number(0)
                  sendRes(stock1,likeCount,res)
                }
              })
            }
            else{
              // case symbol found, check if address exists
              let likedBy = data.likedBy
              let addressAlreadyExists = false
              likedBy.forEach(element => {
                if (element == clientAddress){
                  addressAlreadyExists = true
                }
              });
              // if found then don't add like, return like count
              if(addressAlreadyExists===true){
                likeCount = Number(likedBy.length)
                sendRes(stock1,likeCount,res)
              }
              // if not found add like, return like count + 1
              else{
                collection.updateOne({ symbol: stockName1 }, {
                  $push: { likedBy:  clientAddress  }
                })
                likeCount = Number(likedBy.length+1)
                sendRes(stock1,likeCount,res)
              }
            }
          })
        }




        // case: 2 stocks

        else if (stocks.length === 2) {
          if (stocks[1].length !== 4 || stocks[0].length !== 4) return res.send({
            error: 'Invalid stocks'
          })
          const resp1 = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stocks[0]}/quote`)
          const resp2 = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stocks[1]}/quote`)
          const stock1 = await resp1.json()
          const stock2 = await resp2.json()
          if (stock1 === 'Unknown symbol' || stock2 === 'Unknown symbol') {
            return res.send({
              error: 'Invalid stocks'
            })
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
          res.send({
            stockData: stockData
          })
        }



        // unpredictable error
        else {
          return res.send('Internal/input error')
        }




        

      }

      // invalid stocks
      else {
        res.send({
          error: 'Invalid stocks'
        })
      }
    });

};