import { Request, Response } from 'express';
import { Wallet } from '../models/Wallet.js';
import { Transaction } from '../models/Transaction.js';

/**
 * Get wallet balance for user
 */
export async function getWallet(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    res.status(200).json({
      wallet: {
        id: wallet._id,
        balance: wallet.balance,
        currency: wallet.currency,
      },
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Get wallet statistics (monthly expenses, received, transfers)
 */
export async function getWalletStats(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get transactions for this month
    const transactions = await Transaction.find({
      userId,
      transactionDate: { $gte: firstDayOfMonth },
    });

    let monthlyExpenses = 0;
    let monthlyReceived = 0;
    let bankTransfers = 0;

    transactions.forEach((tx) => {
      if (tx.transactionType === 'withdrawal') {
        monthlyExpenses += tx.amount;
      }
      if (tx.transactionType === 'send') {
        monthlyExpenses += tx.amount;
      }
      if (tx.transactionType === 'transfer') {
        bankTransfers += tx.amount;
      }
      if (tx.transactionType === 'deposit') {
        monthlyReceived += tx.amount;
      }
    });

    res.status(200).json({
      stats: {
        monthlyExpenses,
        monthlyReceived,
        bankTransfers,
        transactionCount: transactions.length,
      },
    });
  } catch (error) {
    console.error('Get wallet stats error:', error);
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
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Update wallet balance
    const wallet = await Wallet.findOneAndUpdate(
      { userId },
      { $inc: { balance: amount } },
      { new: true }
    );

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Create transaction record
    await Transaction.create({
      userId,
      transactionType: 'deposit',
      amount,
      description: description || 'Add money',
      status: 'completed',
    });

    console.log('Created deposit transaction:', { userId, amount, description });

    res.status(200).json({
      message: 'Money added successfully',
      wallet: {
        balance: wallet.balance,
        currency: wallet.currency,
      },
    });
  } catch (error) {
    console.error('Add money error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Withdraw money from wallet
 */
export async function withdrawMoney(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Check balance
    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Update wallet balance
    await Wallet.findOneAndUpdate(
      { userId },
      { $inc: { balance: -amount } },
      { new: true }
    );

    // Create transaction record
    await Transaction.create({
      userId,
      transactionType: 'withdrawal',
      amount,
      description: description || 'Withdrawal',
      status: 'completed',
    });

    console.log('Created withdrawal transaction:', { userId, amount, description });

    res.status(200).json({
      message: 'Money withdrawn successfully',
      wallet: {
        balance: wallet.balance - amount,
        currency: wallet.currency,
      },
    });
  } catch (error) {
    console.error('Withdraw money error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Send money to external recipient
 */
export async function sendMoney(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { amount, description, recipientType, recipient, cardId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    if (!recipientType || !recipient) {
      return res.status(400).json({ message: 'Recipient information is required' });
    }

    // Import Card model
    const { Card } = await import('../models/Card.js');

    // If cardId provided, deduct from card; otherwise from wallet
    if (cardId) {
      const card = await Card.findOne({ _id: cardId, userId });
      if (!card) {
        return res.status(400).json({ message: 'Card not found' });
      }
      if (card.balance < amount) {
        return res.status(400).json({ message: 'Insufficient card balance' });
      }
      // Deduct from card
      await Card.findByIdAndUpdate(cardId, { $inc: { balance: -amount } });
    } else {
      // Deduct from wallet
      const wallet = await Wallet.findOne({ userId });
      if (!wallet || wallet.balance < amount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }
      await Wallet.findOneAndUpdate(
        { userId },
        { $inc: { balance: -amount } },
        { new: true }
      );
    }

    // Create transaction record
    const transaction = await Transaction.create({
      userId,
      transactionType: 'send',
      amount,
      description: description || `Send money via ${recipientType}`,
      status: 'completed',
      recipientType,
      recipient,
      fromCard: cardId || undefined,
    });

    console.log('Created send money transaction:', { userId, amount, recipientType, recipient, cardId });

    res.status(200).json({
      message: 'Money sent successfully',
      transaction: {
        id: transaction._id,
        type: transaction.transactionType,
        amount: transaction.amount,
        status: transaction.status,
      },
    });
  } catch (error) {
    console.error('Send money error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Transfer money between cards
 */
export async function transferMoney(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { fromCardId, toCardId, amount, description } = req.body;

    if (!fromCardId || !toCardId || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid transfer details' });
    }

    if (fromCardId === toCardId) {
      return res.status(400).json({ message: 'Cannot transfer to the same card' });
    }

    // Import Card model
    const { Card } = await import('../models/Card.js');

    // Get both cards to verify ownership and check balance
    const fromCard = await Card.findOne({ _id: fromCardId, userId });
    const toCard = await Card.findOne({ _id: toCardId, userId });

    if (!fromCard || !toCard) {
      return res.status(400).json({ message: 'Invalid card(s)' });
    }

    if (fromCard.balance < amount) {
      return res.status(400).json({ message: 'Insufficient card balance' });
    }

    // Update both card balances
    await Card.findByIdAndUpdate(fromCardId, { $inc: { balance: -amount } });
    await Card.findByIdAndUpdate(toCardId, { $inc: { balance: amount } });

    // Update wallet balance (deduct from user's total)
    await Wallet.findOneAndUpdate(
      { userId },
      { $inc: { balance: -amount } },
      { new: true }
    );

    // Create transaction record for the transfer
    await Transaction.create({
      userId,
      transactionType: 'transfer',
      amount,
      description: description || `Transfer from ${fromCard.bank} to ${toCard.bank}`,
      status: 'completed',
      fromCard: fromCardId,
      toCard: toCardId,
    });

    console.log('Created transfer transaction:', { userId, fromCardId, toCardId, amount });

    res.status(200).json({
      message: 'Transfer completed successfully',
      transfer: {
        fromCard: {
          id: fromCard._id,
          bank: fromCard.bank,
          balance: fromCard.balance - amount,
        },
        toCard: {
          id: toCard._id,
          bank: toCard.bank,
          balance: toCard.balance + amount,
        },
      },
    });
  } catch (error) {
    console.error('Transfer money error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
