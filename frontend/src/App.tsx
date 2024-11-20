import React, { useEffect, useState } from 'react';
import './App.css';
import LandingPage from './pages/landing/LandingPage';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './pages/Layout';
import Statistics from './pages/statistics/Statistics';
import Transactions from './pages/transactions/Transactions';
import { usePortfolioContext } from './hooks/usePortfolioContext';
import axios from 'axios';

function App() {
  const { portfolios, dispatch } = usePortfolioContext();  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const response = await axios.get('http://localhost:4000/ports');
        dispatch({ type: 'SET_PORTFOLIOS', payload: response.data });
      } catch (error) {
        console.error('Error fetching portfolios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolios();
  }, [dispatch]); 

  const router = createBrowserRouter([
    {
      path: "/",
      element: <LandingPage data={portfolios || []} />, 
    },
    {
      path: "/statistics/:portId",
      element: <Layout data={portfolios || []} page={<Statistics />} />,
    },
    {
      path: "/transactions/:portId",
      element: <Layout data={portfolios || []} page={<Transactions />} />,
    },
  ]);

  if (loading) {
    return <div>Loading...</div>; 
  }

  return <RouterProvider router={router} />;
}

export default App;
