// import AppError from '../errors/AppError';
import { getRepository, getCustomRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

import AppError from '../errors/AppError';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  categoryTitle: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    categoryTitle,
  }: RequestDTO): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);
    const roundedValue = Number(value.toFixed(2));

    if (type !== 'income' && type !== 'outcome') {
      throw new AppError("Transaction type must be 'income' or 'outcome'");
    }

    const balance = await transactionsRepository.getBalance();
    if (type === 'outcome' && balance.total - roundedValue < 0) {
      throw new AppError('Insufficient funds', 400);
    }

    let category = await categoriesRepository.findOne({
      where: { title: categoryTitle },
    });

    if (!category) {
      category = categoriesRepository.create({ title: categoryTitle });

      await categoriesRepository.save(category);
    }

    const transaction = transactionsRepository.create({
      title,
      value: roundedValue,
      type,
      category_id: category.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
