const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 4000;
const FINNHUB_API_KEY = 'cs01pehr01qrbtrl68agcs01pehr01qrbtrl68b0';
//this is the key i got it from alpha vintage

let balance = 10000; 
let position = 0;    
let tradeHistory = []; 
//we took starting balance 10000.
app.use(express.static('public'));
const logTrade = (action, shares, price, symbol) => {
    const trade = {
        action,
        shares,
        price,
        symbol,
        timestamp: new Date().toISOString()
    };
    tradeHistory.push(trade);
};
const tradingBot = (stock) => {
    const { price, symbol } = stock;

    if (price <= price * 0.98 && position === 0) {
        const shares = Math.floor(balance / price);
        position += shares;
        balance -= shares * price;
        logTrade('buy', shares, price, symbol);
        console.log(`Bought ${shares} shares of ${symbol} at ${price}`);
    }

    if (price >= price * 1.03 && position > 0) {
        balance += position * price;
        logTrade('sell', position, price, symbol);
        console.log(`Sold ${position} shares of ${symbol} at ${price}`);
        position = 0; 
    }

    console.log(`Current balance: ${balance}`);
};

// we are fetching stock prices here
const fetchStockPrice = async () => {
    try {
        const response = await axios.get(`https://finnhub.io/api/v1/quote?symbol=IBM&token=${FINNHUB_API_KEY}`);

        const stockData = response.data;

        return {
            symbol: 'IBM',
            price: stockData.c,  
        };
    } catch (error) {
        console.error('Error fetching stock data:', error.message);
        throw new Error('Failed to fetch stock data.');
    }
};
setInterval(async () => {
    try {
        const stock = await fetchStockPrice();
        tradingBot(stock);
    } catch (error) {
        console.error('Error in trading bot:', error);
    }
}, 5000); 
app.get('/api/report', (req, res) => {
    res.json({
        balance,
        position,
        tradeHistory
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
