import React, { useEffect, useState } from 'react';
import './App.css';
import LandingPage from './pages/landing/LandingPage';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './pages/Layout';
import Statistics from './pages/statistics/Statistics';
import Transactions from './pages/transactions/Transactions';
import { Portfolio } from '../src/interfaces/interfaces'
import axios from 'axios';

function App() {

  const [data, setData] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('http://localhost:4000/ports')
    .then(res =>{
      setData(res.data)
      setLoading(false)
    }).catch(err => {
      console.error(err);
      setLoading(false)
    })
  }, [])


const router = createBrowserRouter([
  { //root page aka Landing page
    path: "/",
    element: <LandingPage data={data}/>
  },
  { //Statistics page
    path: "/statistics/:portId",
    element: <Layout data={data} page={<Statistics/>} />
  },
  { //Trades page
    path: "/transactions/:portId",
    element: <Layout data={data} page={<Transactions/>} />
  }
])

  return (
    <RouterProvider router={router}/>
  );

}

export default App;
