import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    let income = 0;
    let outcome = 0;

    if (transactions.length > 0) {
      const incomes = transactions.map(transaction => {
        if (transaction.type === 'income') {
          return transaction.value;
        }
        return 0.0;
      });

      const outcomes = transactions.map(transaction => {
        if (transaction.type === 'outcome') {
          return transaction.value;
        }
        return 0.0;
      });

      income = incomes.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
      );

      outcome = outcomes.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
      );
    }

    return {
      income,
      outcome,
      total: income - outcome,
    };
  }
}

export default TransactionsRepository;
