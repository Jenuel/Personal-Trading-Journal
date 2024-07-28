import React from 'react';
import './Transactions.css';
import AddTrade from '../../components/AddTrade';
import Trade from '../../components/Trade';

function Transactions() {

  interface TradeData {
    category: string;
    currencyPair: string;
    entryPrice: number;
    closingPrice: number;
    entryTime: Date;
    closingTime: Date;
    units: number;
    return: number;
    status: string;
    description: string;
    balance: string;
  }

  const sampleTrades = [
    {
      category: "Long",
      currencyPair: "EUR/USD",
      entryPrice: 1.1234,
      closingPrice: 1.1345,
      entryTime: new Date("2024-07-01T08:30:00Z"),
      closingTime: new Date("2024-07-01T14:45:00Z"),
      units: 1000,
      return: 11.1,
      status: "WIN",
      description: "Profitable trade based on technical analysis.",
      balance: "60a73f7a9e7b4c10d88876f8"
    },
    {
      category: "Short",
      currencyPair: "GBP/USD",
      entryPrice: 1.2500,
      closingPrice: 1.2400,
      entryTime: new Date("2024-07-02T09:00:00Z"),
      closingTime: new Date("2024-07-02T16:00:00Z"),
      units: 2000,
      return: 20,
      status: "WIN",
      description: "Short-term trade based on market news.",
      balance: "60a73f7a9e7b4c10d88876f9"
    },
    {
      category: "Long",
      currencyPair: "USD/JPY",
      entryPrice: 110.50,
      closingPrice: 112.00,
      entryTime: new Date("2024-07-03T11:00:00Z"),
      closingTime: new Date("2024-07-03T15:00:00Z"),
      units: 100,
      return: 150,
      status: "WIN",
      description: "Intraday trade based on positive economic data.",
      balance: "60a73f7a9e7b4c10d88876fa"
    },
    {
      category: "Short",
      currencyPair: "EUR/USD",
      entryPrice: 1.1345,
      closingPrice: 1.1300,
      entryTime: new Date("2024-07-04T10:00:00Z"),
      closingTime: new Date("2024-07-04T17:00:00Z"),
      units: 500,
      return: 22.5,
      status: "WIN",
      description: "Successful short trade during a market downturn.",
      balance: "60a73f7a9e7b4c10d88876fb"
    },
    {
      category: "Long",
      currencyPair: "GBP/USD",
      entryPrice: 1.2400,
      closingPrice: 1.2300,
      entryTime: new Date("2024-07-05T13:00:00Z"),
      closingTime: new Date("2024-07-05T19:00:00Z"),
      units: 1500,
      return: -15,
      status: "LOSS",
      description: "Loss due to adverse market movement.",
      balance: "60a73f7a9e7b4c10d88876fc"
    }
  ];

  const handleTradeClick = (trade : TradeData) => {
    console.log(trade)
  }

  return (
    <div className='trades-container'>
      <div className="table-container">
        <div className="contents">
          <div className="filter">
            <AddTrade />
          </div>
          <div className="header-container">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Currency Pair</th>
                  <th>Entry Price</th>
                  <th>Closing Price</th>
                  <th>Entry Time</th>
                  <th>Closing Time</th>
                  <th>Units</th>
                  <th>Return</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sampleTrades.map((trade, index) => (
                  <Trade key={index} data={trade} onClick={() => handleTradeClick(trade)} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );  
}

export default Transactions;
