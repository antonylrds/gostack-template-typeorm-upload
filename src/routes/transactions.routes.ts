import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import path from 'path';
import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ParseTransactionsService from '../services/ParseTransactionsService';
import Transaction from '../models/Transaction';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionsRepository.find();
  const balance = await transactionsRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;
  const createTransaction = new CreateTransactionService();
  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    categoryTitle: category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute(id);

  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const transactions: Transaction[] = [];
    const parserTransactions = new ParseTransactionsService();
    const createTransaction = new CreateTransactionService();

    const filePath = path.join(uploadConfig.directory, request.file.filename);
    const transactionsArray = await parserTransactions.execute(filePath);

    for (let index = 0; index < transactionsArray.length; index += 1) {
      const { title, type, value, category } = transactionsArray[index];

      transactions.push(
        // eslint-disable-next-line no-await-in-loop
        await createTransaction.execute({
          title,
          type,
          value,
          categoryTitle: category,
        }),
      );
    }

    return response.json(transactions);
  },
);

export default transactionsRouter;
