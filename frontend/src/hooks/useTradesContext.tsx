import { useContext } from "react";
import { TradesContext } from "../context/TradeContext";

export const useTradesContext = () => {
  const context = useContext(TradesContext);

  if (!context) {
    throw new Error("useTradesContext must be used within a TradesContextProvider");
  }
  return context;
};
