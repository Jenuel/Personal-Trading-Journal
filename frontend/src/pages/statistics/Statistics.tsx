import React, { useEffect, useState } from "react";
import axios from "axios";
import "../statistics/Statistics.css";
import LineGraph from "./graphs/LineGraph";
import { useParams } from "react-router-dom";
import DoughnotChart from "./graphs/DoughnutGraph";
import BarChart from "./graphs/BarChart";
import AccumulatedReturnsChart from "./graphs/AccumulatedReturnsChart";

function Statistics() {
  const { portId } = useParams<{ portId: string }>();
  const [port, setPort] = useState<{ initialBalance: number } | undefined>();
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:4000/trades/port/${portId}`);
        setTrades(res.data);
        console.log(res.data);
      } catch (err: any) {
        console.error("Error fetching trades:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchPort = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/ports/${portId}`);
        setPort(res.data);
      } catch (error: any) {
        console.error("Error:", error);
      }
    };

    if (portId) {
      fetchTrades();
      fetchPort();
    }
  }, [portId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!port) {
    return <p>Error loading portfolio data</p>;
  }

  return (
    <div className="statistics">
      <div className="bar-container">
        <LineGraph trades={trades} initialPortfolioValue={port.initialBalance} />
      </div>
      <div className="bar-container">
        <DoughnotChart trades={trades} />
      </div>
      <div className="bar-container">
        <BarChart trades={trades} />
      </div>
      <div className="bar-container">
        <AccumulatedReturnsChart trades={trades} />
      </div>
    </div>
  );
}

export default Statistics;
