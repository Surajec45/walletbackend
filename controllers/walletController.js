const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/transaction');

function ensureCurrency(user, currency) {
  if (!user.balances.has(currency)) {
    user.balances.set(currency, 0);
  }
}

exports.getTransactionHistory = async (req, res) => {
  const userId = req.user._id;
  const transactions = await Transaction.find({
    $or: [{ from: userId }, { to: userId }]
  }).sort({ timestamp: -1 });
  res.json(transactions);
};

async function checkTransferRateLimit(userId) {
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const count = await Transaction.countDocuments({
    from: userId,
    type: 'transfer',
    timestamp: { $gte: oneMinuteAgo }
  });
  return count >= 5;
}

async function checkLargeWithdrawal(amount, currency) {
  const thresholdUSD = 1000;
  return currency === 'USD' && amount > thresholdUSD;
}

async function logAnomaly(userId, reason) {
  console.warn(`Fraud Alert: User ${userId} - ${reason}`);
}

exports.deposit = async (req, res) => {
  try {
    const { amount, currency } = req.body;
    if (amount <= 0) return res.status(400).json({ message: 'Invalid deposit amount' });

    const user = await User.findById(req.user._id);
    ensureCurrency(user, currency);
    user.balances.set(currency, user.balances.get(currency) + amount);
    await user.save();

    await Transaction.create({
      from: user._id,
      to: user._id,
      type: 'deposit',
      amount,
      currency
    });

    res.json({ balances: Object.fromEntries(user.balances) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.withdraw = async (req, res) => {
  try {
    const { amount, currency } = req.body;
    if (amount <= 0) return res.status(400).json({ message: 'Invalid withdrawal amount' });

    const user = await User.findById(req.user._id);
    ensureCurrency(user, currency);

    if (user.balances.get(currency) < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    if (await checkLargeWithdrawal(amount, currency)) {
      await logAnomaly(user._id, `Large withdrawal of ${amount} ${currency}`);
    }

    user.balances.set(currency, user.balances.get(currency) - amount);
    await user.save();

    await Transaction.create({
      from: user._id,
      to: user._id,
      type: 'withdraw',
      amount,
      currency
    });

    res.json({ balances: Object.fromEntries(user.balances) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.transfer = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { amount, currency, toEmail } = req.body;
    if (amount <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Invalid transfer amount' });
    }
    const toUser=await User.findOne({email:toEmail});
    const toUserId=toUser._id;
    if (req.user._id.toString() === toUserId.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Cannot transfer to self' });
    }

    const sender = await User.findById(req.user._id).session(session);
    const recipient = await User.findById(toUserId).session(session);
    if (!recipient) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Recipient not found' });
    }

    ensureCurrency(sender, currency);
    ensureCurrency(recipient, currency);

    if (sender.balances.get(currency) < amount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    if (await checkTransferRateLimit(sender._id)) {
      await logAnomaly(sender._id, 'High frequency transfers');
    }

    sender.balances.set(currency, sender.balances.get(currency) - amount);
    recipient.balances.set(currency, recipient.balances.get(currency) + amount);

    await sender.save({ session });
    await recipient.save({ session });

    await Transaction.create([{
      from: sender._id,
      to: recipient._id,
      type: 'transfer',
      amount,
      currency
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.json({ balances: Object.fromEntries(sender.balances) });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: err.message });
  }
};