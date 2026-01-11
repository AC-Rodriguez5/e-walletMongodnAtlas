import { Request, Response } from 'express';
import { Transaction } from '../models/Transaction.js';
import { Wallet } from '../models/Wallet.js';
import { sendTransactionEmail } from '../services/emailService.js';

/**
 * Create transaction
 */
export async function createTransaction(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { transactionType, amount, description, recipientEmail, fromCard, toCard } = req.body;

    if (!transactionType || !amount) {
      return res.status(400).json({ message: 'Transaction type and amount are required' });
    }

    const transaction = await Transaction.create({
      userId,
      transactionType,
      amount,
      description: description || '',
      recipientEmail: recipientEmail || '',
      fromCard: fromCard || null,
      toCard: toCard || null,
      status: 'completed',
    });

    // Update wallet balance
    const wallet = await Wallet.findOne({ userId });
    if (wallet) {
      if (transactionType === 'deposit') {
        wallet.balance += amount;
      } else if (transactionType === 'withdrawal' || transactionType === 'transfer') {
        wallet.balance -= amount;
      }
      await wallet.save();
    }

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction: {
        id: transaction._id,
        type: transaction.transactionType,
        amount: transaction.amount,
        status: transaction.status,
        date: transaction.transactionDate,
      },
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Get transactions
 */
export async function getTransactions(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const transactions = await Transaction.find({ userId })
      .sort({ transactionDate: -1 })
      .limit(50);

    res.status(200).json({
      transactions: transactions.map((t) => ({
        id: t._id,
        type: t.transactionType,
        amount: t.amount,
        status: t.status,
        description: t.description,
        date: t.transactionDate,
      })),
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Get wallet balance
 */
export async function getWalletBalance(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      wallet = await Wallet.create({
        userId,
        balance: 0,
        currency: 'USD',
      });
    }

    res.status(200).json({
      balance: wallet.balance,
      currency: wallet.currency,
    });
  } catch (error) {
    console.error('Get wallet balance error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Add money to wallet
 */
export async function addMoney(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    // Create transaction
    const transaction = await Transaction.create({
      userId,
      transactionType: 'deposit',
      amount,
      description: description || 'Money added',
      status: 'completed',
    });

    // Update wallet
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId, balance: 0 });
    }
    wallet.balance += amount;
    await wallet.save();

    res.status(200).json({
      message: 'Money added successfully',
      balance: wallet.balance,
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
      },
    });
  } catch (error) {
    console.error('Add money error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
