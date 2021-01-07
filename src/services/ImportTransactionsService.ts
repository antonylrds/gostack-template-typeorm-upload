import { getCustomRepository, getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface TransactionDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(transactions: TransactionDTO[]): Promise<Transaction[]> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const transactionsModel: Transaction[] = [];

    transactions.map(async transaction => {
      let category = await categoriesRepository.findOne({
        where: { title: transaction.category },
      });

      if (!category) {
        category = categoriesRepository.create({ title: transaction.category });

        await categoriesRepository.save(category);
      }
      transactionsModel.push(
        transactionsRepository.create({
          title: transaction.title,
          type: transaction.type,
          value: transaction.value,
          category_id: category.id,
        }),
      );
    });

    await transactionsRepository.save(transactionsModel);

    return transactionsModel;
  }
}

export default ImportTransactionsService;
