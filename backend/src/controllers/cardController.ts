import { Request, Response } from 'express';
import { Card } from '../models/Card.js';
import { Wallet } from '../models/Wallet.js';
import { Transaction } from '../models/Transaction.js';

/**
 * Add new card
 */
export async function addCard(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    console.log('Add card request - userId:', userId);
    console.log('Request user:', (req as any).user);
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { cardNumber, cardHolder, expiryDate, cvv, cardType, bank, initialBalance } = req.body;
    console.log('Card data:', { cardNumber, cardHolder, expiryDate, cvv, cardType, bank, initialBalance });

    if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const balanceValue = parseFloat(initialBalance) || 0;

    const card = await Card.create({
      userId,
      cardNumber,
      cardHolder,
      expiryDate,
      cvv,
      cardType: cardType || 'debit',
      bank: bank || '',
      balance: balanceValue,
      isDefault: false,
      isActive: true,
    });

    console.log('Created card:', card);

    // If initial balance provided, update user's wallet and create a transaction
    if (balanceValue > 0) {
      await Wallet.findOneAndUpdate({ userId }, { $inc: { balance: balanceValue } });
      await Transaction.create({
        userId,
        transactionType: 'deposit',
        amount: balanceValue,
        description: `Initial balance for card ${card._id}`,
        status: 'completed',
      });
    }

    res.status(201).json({
      message: 'Card added successfully',
      card: {
        id: card._id,
        cardNumber: card.cardNumber.slice(-4),
        cardHolder: card.cardHolder,
        balance: card.balance || 0,
        cardType: card.cardType,
        bank: card.bank,
      },
    });
  } catch (error) {
    console.error('Add card error:', error);
    res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

/**
 * Get all cards for user
 */
export async function getCards(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    console.log('Get cards request - userId:', userId);
    // Show how many cards exist in DB for debugging
    const totalCards = await Card.countDocuments({});
    console.log('Total cards in DB:', totalCards);

    const cards = await Card.find({ userId });
    console.log(`Cards found for user ${userId}:`, cards.length);

    res.status(200).json({
      cards: cards.map((card) => ({
        id: card._id,
        cardNumber: card.cardNumber.slice(-4),
        cardHolder: card.cardHolder,
        expiryDate: card.expiryDate,
        cardType: card.cardType,
        bank: card.bank,
        balance: card.balance || 0,
        isDefault: card.isDefault,
      })),
    });
  } catch (error) {
    console.error('Get cards error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Remove card
 */
export async function removeCard(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    const cardId = req.params.cardId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const card = await Card.findOneAndDelete(
      { _id: cardId, userId }
    );

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    console.log('Deleted card:', card);

    res.status(200).json({
      message: 'Card removed successfully',
    });
  } catch (error) {
    console.error('Remove card error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Set default card
 */
export async function setDefaultCard(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    const cardId = req.params.cardId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Remove default from all cards
    await Card.updateMany({ userId }, { isDefault: false });

    // Set new default
    const card = await Card.findOneAndUpdate(
      { _id: cardId, userId },
      { isDefault: true },
      { new: true }
    );

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    res.status(200).json({
      message: 'Default card updated successfully',
    });
  } catch (error) {
    console.error('Set default card error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Add money to a specific card
 */
export async function addMoneyToCard(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    const cardId = req.params.cardId;
    const { amount, description } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Update card balance
    const card = await Card.findOneAndUpdate(
      { _id: cardId, userId },
      { $inc: { balance: amount } },
      { new: true }
    );

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Create transaction record
    await Transaction.create({
      userId,
      transactionType: 'deposit',
      amount,
      description: description || `Add money to ${card.bank || card.cardType}`,
      status: 'completed',
    });

    res.status(200).json({
      message: 'Money added successfully',
      card: {
        id: card._id,
        balance: card.balance,
      },
    });
  } catch (error) {
    console.error('Add money to card error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
