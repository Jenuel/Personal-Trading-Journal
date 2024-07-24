import React, { useState } from 'react'

interface AddTradeModalProps{
    closeModal: () => void;
}
//type
//currency pair 
//entry price
//closing price
//entry time
//closing time
//units
//return
//status
//description
//balance
function AddTradeModal({closeModal}: AddTradeModalProps) {
  const [category, setCategory] = useState<string>('')
  const [currencyPair, setCurrencyPair]= useState<string>('')
  const [entryPrice, setEntryPrice] = useState<number>(0)
  const [closingPrice, setClosingPrice] = useState<number>(0)
  const [entryTime, setEntryTime] = useState<Date | null>(null)
  const [closingTime, setClosingTime] = useState<number>(0)
  const [result, setResult] = useState<number>(0)
  const [status, setStatus] = useState<string>('')
  const [description, setDescription]= useState<string>('')


  const majorCurrencyPairs: string[] = ["EUR/USD", "USD/JPY", "GBP/USD"];

  const handleCategorySelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(event.target.value)
  }

  const handleCurrencySelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrencyPair(event.target.value)
  }

  return (
    <div>
      <select className="category" value={category} onChange={handleCategorySelect}>
        <option value="">Please select a transaction</option>
        <option value="Long">LONG</option>
        <option value="Short">SHORT</option>
      </select>

      <select className="pairs" value={currencyPair} onChange={handleCurrencySelect}>
        <option value="">Please select a transaction</option>
        {majorCurrencyPairs.map((pair, index) => (
          <option key={index} value={pair}>
            {pair}
          </option>
        ))}
      </select>

      
    </div>
  )
}

export default AddTradeModal