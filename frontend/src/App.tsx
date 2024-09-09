import React, { useEffect, useState } from 'react';
import './App.css';
import LandingPage from './pages/landing/LandingPage';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './pages/Layout';
import Statistics from './pages/statistics/Statistics';
import Transactions from './pages/transactions/Transactions';
import { Portfolio } from '../src/interfaces/interfaces';
import axios from 'axios';

function App() {
  const [data, setData] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const response = await axios.get('http://localhost:4000/ports');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching portfolios:', error);
      } finally {
        setLoading(false);
      }
    }
  
    fetchPortfolios();
  }, []);

  const router = createBrowserRouter([
    { // Root page aka Landing page
      path: "/",
      element: <LandingPage data={data} />
    },
    { // Statistics page
      path: "/statistics/:portId",
      element: <Layout data={data} page={<Statistics />} />
    },
    { // Transactions page
      path: "/transactions/:portId",
      element: <Layout data={data} page={<Transactions />} />
    }
  ]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <RouterProvider router={router} />
  );
}

export default App;
