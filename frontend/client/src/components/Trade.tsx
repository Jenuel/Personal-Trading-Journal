import React from 'react';

interface Trade {
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

interface TradeProps {
  data: Trade;
  onClick: () => void;
}

function Trade({ data, onClick }: TradeProps) {
  return (
    <tr onClick={onClick} style={{ cursor: 'pointer' }}>
      <td>{data.category}</td>
      <td>{data.currencyPair}</td>
      <td>{data.entryPrice}</td>
      <td>{data.closingPrice}</td>
      <td>{data.entryTime.toLocaleString()}</td>
      <td>{data.closingTime.toLocaleString()}</td>
      <td>{data.units}</td>
      <td>{data.return}</td>
      <td>{data.status}</td>
      <td><button>Delete</button></td>
    </tr>
  );
}

export default Trade;
