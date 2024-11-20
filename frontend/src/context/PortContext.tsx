import { createContext, useReducer, ReactNode, Dispatch } from "react";
import { Portfolio } from "../interfaces/interfaces";

// Define the shape of the state and action types
interface PortfolioState {
  portfolios: Portfolio[] | null;
}

type PortfolioAction =
  | { type: "SET_PORTFOLIOS"; payload: Portfolio[] }
  | { type: "UPDATE_PORTFOLIO"; payload: Portfolio }
  | { type: "DELETE_PORTFOLIO"; payload: string };

// Create initial state
const initialState: PortfolioState = {
  portfolios: null,
};

// Define the context type
interface PortfolioContextProps {
  portfolios: Portfolio[] | null;
  dispatch: Dispatch<PortfolioAction>;
}

export const PortfolioContext = createContext<PortfolioContextProps | undefined>(undefined);

// Reducer function
export const portfolioReducer = (state: PortfolioState, action: PortfolioAction): PortfolioState => {
  switch (action.type) {
    case "SET_PORTFOLIOS": {
      return { portfolios: action.payload };
    }
    case "UPDATE_PORTFOLIO": {
      const updatedPortfolios = state.portfolios
        ? state.portfolios.map((portfolio) =>
            portfolio._id === action.payload._id ? action.payload : portfolio
          )
        : [action.payload];

      return { portfolios: updatedPortfolios };
    }
    case "DELETE_PORTFOLIO": {
      const filteredPortfolios = state.portfolios
        ? state.portfolios.filter((portfolio) => portfolio._id !== action.payload)
        : null;

      return { portfolios: filteredPortfolios };
    }
    default:
      return state;
  }
};

// Context Provider
export const PortfolioContextProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(portfolioReducer, initialState);

  return (
    <PortfolioContext.Provider value={{ ...state, dispatch }}>
      {children}
    </PortfolioContext.Provider>
  );
};
