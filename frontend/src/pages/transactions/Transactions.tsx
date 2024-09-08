import React, { useEffect, useState } from 'react';
import './Transactions.css';
import AddTrade from '../../components/AddTrade';
import TradeComponent from '../../components/TradeComponent';
import ConfirmationModal from '../modals/ConfirmationModal';
import { Trade } from '../../interfaces/interfaces';
import DetailModal from '../modals/DetailModal';
import axios from 'axios';
import { useParams } from 'react-router-dom'

function Transactions() {
  
  const { portId } = useParams()
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState(false)
  const [tradeToDelete, setTradeToDelete] = useState<Trade | null>(null)
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  useEffect(() => {
    const fetchTrades = async () => {
      axios.get(`http://localhost:4000/trades/port/${portId}`)
      .then(res =>{
        setTrades(res.data)
        setLoading(false)
      }).catch(err => {
        console.error(err);
        setLoading(false)
      })
    }
    fetchTrades()
    
  }) 
  //set the modal for detailed view open
  const handleTradeClick = (trade: Trade) => {
    console.log(trade);
    setSelectedTrade(trade);
  };

  //prompts the modal confirmation
  const handleDeleteClick = (trade: Trade) => {
    console.log(`Confirm deletion of  trade with balance: ${trade.balance}`);
    setTradeToDelete(trade)
    setConfirm(true)
  };

  //actually deletes the data
  const handleDelete = () => {
    if (tradeToDelete) {
      console.log(`Deleting trade with balance: ${tradeToDelete.balance}`);
      // Perform delete operation here, for example updating the state or making an API call
      setTradeToDelete(null);
    }
    setConfirm(false);
  }

  const handleSave = (updatedTrade: Trade) => {
  }

  return (
    <div className='trades-container'>
      <div className="filter">
        <AddTrade />
      </div>
      <div className="table-container">
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
            {trades.map((trade, index) => (
              <TradeComponent
                key={index}
                data={trade}
                onClick={() => handleTradeClick(trade)}
                onDelete={() => handleDeleteClick(trade)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmationModal 
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={handleDelete}
        message={'Are you sure that you want to delete this trade?'}
      />

      {selectedTrade && (
        <DetailModal 
          open={!!selectedTrade}
          onClose={() => setSelectedTrade(null)}
          data={selectedTrade}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default Transactions;
