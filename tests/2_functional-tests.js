const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    test('Viewing one stock: GET request to /api/stock-prices/',()=>{
        chai.request(server)
            .get('/api/stock-prices')
            .query({
                stock: 'goog'
            })
            .end((err,res)=>{
                assert.equal(res.status, 200)
                assert.property(res.body, 'stockData')
                assert.property(res.body.stockData, 'stock')
                assert.equal(res.body.stockData.stock, 'GOOG')
                assert.property(res.body.stockData, 'price')
            })
    })
    test('Viewing one stock and liking it: GET request to /api/stock-prices/',()=>{
        chai.request(server)
            .get('/api/stock-prices')
            .query({
                stock: 'goog',
                like: 'true'
            })
            .end((err,res)=>{
                assert.equal(res.status, 200)
                assert.isAbove(res.body.stockData.likes, 0)
            })
    })
    test('Viewing the same stock and liking it again: GET request to /api/stock-prices/',()=>{
        chai.request(server)
            .get('/api/stock-prices')
            .query({
                stock: 'goog',
                like: 'true'
            })
            .end((err,res)=>{
                assert.equal(res.status, 200)
                assert.isAbove(res.body.stockData.likes,0)
            })
    })
    test('Viewing two stocks: GET request to /api/stock-prices/',()=>{
        chai.request(server)
            .get('/api/stock-prices')
            .query({
                stock: ['goog','msft']
            })
            .end((err,res)=>{
                assert.equal(res.status, 200)
                assert.property(res.body, 'stockData')
                res.body.stockData.forEach(stockData => {
                    assert.property(stockData, 'stock')
                    assert.property(stockData, 'price')
                    assert.property(stockData, 'rel_likes')
                });
            })
    })
    test('Viewing two stocks and liking them: GET request to /api/stock-prices',()=>{
        chai.request(server)
            .get('/api/stock-prices')
            .query({
                stock: ['goog','msft'],
                like: true
            })
            .end((err,res)=>{
                assert.equal(res.status, 200)
                assert.property(res.body, 'stockData')
                res.body.stockData.forEach(stockData => {
                    assert.property(stockData, 'stock')
                    assert.property(stockData, 'price')
                    assert.property(stockData, 'rel_likes')
                    assert.equal(stockData.rel_likes, Number(0))
                });
                assert.equal(res.body.stockData[0].stock, 'GOOG')
                assert.equal(res.body.stockData[1].stock, 'MSFT')
            })
    })

});
