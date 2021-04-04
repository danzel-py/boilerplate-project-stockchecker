'use strict';

const e = require('express');
const fetch = require('node-fetch');
const {
  response
} = require('../server');

function sendRes(stock1, likeCount, res) {
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
          const resp1 = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stocks}/quote`)
          const stock1 = await resp1.json()
          if (stock1 === 'Unknown symbol') {
            return res.send({
              error: 'Invalid stocks'
            })
          }
          var stockName1 = stock1.symbol

          // handling likes

          collection.findOne({ symbol: stockName1 }, (err, data) => {
            if (err) return console.log(err)
            // case symbol not found
            if (!data) {
              // insert symbol
              collection.insertOne({ symbol: stockName1, likedBy: [] }, (err, data) => {
                if (err) return console.log(err)
                // if like is true push address to likedBy array
                if (like == 'true') {
                  collection.updateOne({ symbol: stockName1 }, {
                    $push: { likedBy: clientAddress }
                  })
                  // initiate likeCount
                  likeCount = Number(1)
                  sendRes(stock1, likeCount, res)

                }
                // if like is not true
                else {
                  likeCount = Number(0)
                  sendRes(stock1, likeCount, res)
                }
              })
            }
            else {
              // case symbol found, check if address exists
              let likedBy = data.likedBy
              let addressAlreadyExists = false
              likedBy.forEach(element => {
                if (element == clientAddress) {
                  addressAlreadyExists = true
                }
              });
              // if not found and like is true: add like, return like count + 1
              if (addressAlreadyExists === false && like == 'true') {
                collection.updateOne({ symbol: stockName1 }, {
                  $push: { likedBy: clientAddress }
                })
                likeCount = Number(likedBy.length + 1)
                sendRes(stock1, likeCount, res)
              }
              // if found don't add like, return like count 
              else {
                likeCount = Number(likedBy.length)
                sendRes(stock1, likeCount, res)
              }
            }
          })
        }




        // case: 2 stocks

        else if (stocks.length === 2) {
          const resp1 = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stocks[0]}/quote`)
          const resp2 = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stocks[1]}/quote`)
          const stock1 = await resp1.json()
          const stock2 = await resp2.json()
          if (stock1 === 'Unknown symbol' || stock2 === 'Unknown symbol') {
            return res.send({
              error: 'Invalid stocks'
            })
          }
          var stockName1 = stock1.symbol
          var stockName2 = stock2.symbol
          
          // handling likes

          const cursor = collection.find({ symbol: { $in: [stockName1, stockName2] } })

          let arr = await cursor.toArray()

          while (arr.length < 2) {
            await arr.push({ symbol: 'default' })
          }

          // re-arrange the order
          if (arr[0].symbol === stockName2 || arr[1].symbol === stockName1) {
            // if not in order, do reverse
            arr.reverse()
          }

          let likeCount1 // will be undefined if stock 1 present in database
          let likeCount2 // will be undefined if stock 2 present in database

          // ADDING SYMBOL TO DATABASE
          if (arr[0].symbol !== stockName1) {
            console.log(' ')
            console.log(stockName1 + " missing from database!")
            console.log(' ')
            console.log(`Adding ${stockName1} to the database`)
            console.log('.')
            console.log('.')
            if (like == 'true') {
              await collection.insertOne({ symbol: stockName1, likedBy: [clientAddress] })
              likeCount1 = Number(1)
            }
            else {
              await collection.insertOne({ symbol: stockName1, likedBy: [] })
              likeCount1 = Number(0)
            }
            console.log(`Added ${stockName1} to collection. Like count: ${likeCount1}`)
            console.log('--------------------------------------')
          }
          if (arr[1].symbol !== stockName2) {
            console.log(' ')
            console.log(stockName2 + " missing from database!")
            console.log(' ')
            console.log(`Adding ${stockName2} to the database`)
            console.log('.')
            console.log('.')
            if (like == 'true') {
              await collection.insertOne({ symbol: stockName2, likedBy: [clientAddress] })
              likeCount2 = Number(1)
            }
            else {
              await collection.insertOne({ symbol: stockName2, likedBy: [] })
              likeCount2 = Number(0)
            }
            console.log(`Added ${stockName2} to collection. Like count: ${likeCount2}`)
            console.log('--------------------------------------')
          }

          // GETTING LIKE COUNT ON SYMBOLS
          if (likeCount1 === undefined) {
            likeCount1 = Number(arr[0].likedBy.length)
            // Update likes
            let likedBy = arr[0].likedBy
            let addressAlreadyExists = false
            likedBy.forEach(element => {
              if (element == clientAddress) {
                addressAlreadyExists = true
              }
            })
            if(addressAlreadyExists === false && like == 'true'){
              likeCount1++
              collection.updateOne({symbol: stockName1},{
                $push: {likedBy: clientAddress}
              })
            }
            console.log(stockName1 + ' is in database. ' + 'Like count: ' + likeCount1)

          }
          if (likeCount2 === undefined) {
            likeCount2 = Number(arr[1].likedBy.length)
            // Update likes
            let likedBy = arr[1].likedBy
            let addressAlreadyExists = false
            likedBy.forEach(element => {
              if (element == clientAddress) {
                addressAlreadyExists = true
              }
            })
            if(addressAlreadyExists === false && like == 'true'){
              likeCount2++
              collection.updateOne({symbol: stockName2},{
                $push: {likedBy: clientAddress}
              })
            }
            console.log(stockName2 + ' is in database. ' + 'Like count: ' + likeCount2)
          }

          console.log(likeCount1 + ' vs ' + likeCount2)

          let rel_likes = likeCount1 - likeCount2
          

          const stockData1 = {
            stock: stockName1,
            price: stock1.latestPrice,
            rel_likes: rel_likes
          }
          const stockData2 = {
            stock: stockName2,
            price: stock2.latestPrice,
            rel_likes: -rel_likes
          }
          var stockData = [stockData1, stockData2]

          res.send({
            stockData: stockData
          })
        }

        // case: unpredictable error
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