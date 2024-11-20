import { useContext } from "react";
import { PortfolioContext } from "../context/PortContext";

export const usePortfolioContext = () => {
  const context = useContext(PortfolioContext);

  if (!context) {
    throw new Error("usePortfolioContext must be used within a PortfolioContextProvider");
  }
  return context;
};
