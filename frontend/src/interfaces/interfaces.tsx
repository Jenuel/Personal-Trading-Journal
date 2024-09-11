export interface Portfolio {
    _id: string;
    portName: string;
    balance: number;
    createdAt: string;
}
  
  

export interface Trade {
    _id: string
    category: string;
    currencyPair: string;
    entryPrice: number;
    closingPrice: number;
    entryTime: string;
    closingTime: string;
    units: number;
    return: number;
    status: string;
    description: string;
    balance: string;
}