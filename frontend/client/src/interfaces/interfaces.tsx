export interface Portfolio {
    id: string
    name: string
}

export interface Trade {
    category: string;
    currencyPair: string;
    entryPrice: number;
    closingPrice: number;
    entryTime: Date;
    closingTime: Date;
    units: number;
    return: number;
    status: string;
    description: string;
    balance: string;
}