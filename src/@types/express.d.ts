declare namespace Express {
  export interface Request {
    transactions: TransactionDTO[];
  }
}

interface TransactionDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
