import { createContext, useReducer, ReactNode, Dispatch } from "react";
import { Trade } from "../interfaces/interfaces";

// Define the shape of the state and action types
interface TradesState {
  trades: Trade[] | null;
}

type TradesAction = 
  | { type: 'SET_TRADES', payload: Trade[] }
  | { type: 'CREATE_TRADE', payload: Trade }
  | { type: 'UPDATE_TRADE', payload: Trade }
  | { type: 'DELETE_TRADE', payload: string };

// Create initial state
const initialState: TradesState = {
  trades: null
};

// Define the context type
interface TradesContextProps {
  trades: Trade[] | null;
  dispatch: Dispatch<TradesAction>;
}

export const TradesContext = createContext<TradesContextProps | undefined>(undefined);

export const tradesReducer = (state: TradesState, action: TradesAction): TradesState => {
  switch (action.type) {
    case 'SET_TRADES':
      return { trades: action.payload };
    case 'CREATE_TRADE':
      return { trades: [action.payload, ...(state.trades || [])] };
    case 'UPDATE_TRADE':
      return {
        trades: state.trades
          ? state.trades.map((trade) =>
              trade._id === action.payload._id ? action.payload : trade
            )
          : null,
      };
    case 'DELETE_TRADE':
      return {
        trades: state.trades
          ? state.trades.filter((trade) => trade._id !== action.payload)
          : null,
      };
    default:
      return state;
  }
};

export const TradesContextProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(tradesReducer, initialState);

  return (
    <TradesContext.Provider value={{ ...state, dispatch }}>
      {children}
    </TradesContext.Provider>
  );
};
