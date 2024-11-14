import React, { useEffect, useState } from 'react';
import './Transactions.css';
import AddTrade from '../../components/AddTrade';
import TradeComponent from '../../components/TradeComponent';
import ConfirmationModal from '../modals/ConfirmationModal';
import { Trade } from '../../interfaces/interfaces';
import DetailModal from '../modals/DetailModal';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useTradesContext } from '../../hooks/useTradesContext';


function Transactions() {
  const { trades, dispatch } = useTradesContext();
  const { portId } = useParams<{ portId: string }>(); // explicitly type portId
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(false);
  const [tradeToDelete, setTradeToDelete] = useState<Trade | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/trades/port/${portId}`);
        dispatch({ type: 'SET_TRADES', payload: res.data });
      } catch (err: any) {
        if (err.response && err.response.status === 404) {
          dispatch({ type: 'SET_TRADES', payload: [] });
        } else {
          console.error("Error fetching trades:", err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTrades();
  }, [portId, dispatch]);

  const handleTradeClick = (trade: Trade) => {
    setSelectedTrade(trade);
  };

  const handleDeleteClick = (trade: Trade) => {
    setTradeToDelete(trade);
    setConfirm(true);
  };

  //actually deletes the data
  const handleDelete = () => {
    if (tradeToDelete) {
      const id = tradeToDelete._id;
      console.log(tradeToDelete)
      axios.delete(`http://localhost:4000/trades/${id}`)
        .then(response => {
          console.log('Trade deleted:', response.data);
          dispatch({ type: 'DELETE_TRADE', payload: id });
        })
        .catch(error => {
          if (error.response) {
            console.error('Server responded with:', error.response.status, error.response.data);
          } else if (error.request) {
            console.error('No response received:', error.request);
          } else {
            console.error('Error:', error.message);
          }
        });
      setTradeToDelete(null);
    }
    setConfirm(false);
  };

  
  const handleSave = (updatedTrade: Trade) => {
    console.log(updatedTrade);
    axios.put(`http://localhost:4000/trades/${updatedTrade._id}`, updatedTrade)
    .then(response => {
      console.log('Trade edited:', response.data);
      dispatch({ type: 'UPDATE_TRADE', payload: response.data })
    })
    .catch(error => {
      if (error.response) {
        console.error('Server responded with:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error:', error.message);
      }
    });
  };

  if (loading) {
    return <div>Loading...</div>;
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
            {trades && trades.map((trade: Trade, index: number) => (
              <TradeComponent
                key={trade._id}
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
