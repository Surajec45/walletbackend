const User = require('../models/User');
const Transaction = require('../models/transaction');
const FlaggedTransaction = require('../models/flaggedTransaction');

exports.getFlaggedTransactions = async (req, res) => {
  const flagged = await FlaggedTransaction.find()
    .populate('userId', 'name email')
    .populate('transactionId');
  res.json(flagged);
};

exports.getTotalBalances = async (req, res) => {
  const users = await User.find();
  const totals = {};
  users.forEach(user => {
    for (const [currency, balance] of user.balances.entries()) {
      totals[currency] = (totals[currency] || 0) + balance;
    }
  });
  res.json(totals);
};

exports.getTopUsersByBalance = async (req, res) => {
  const users = await User.find();
  const usersWithTotalBalance = users.map(user => ({
    id: user._id,
    name: user.name,
    email: user.email,
    totalBalance: Array.from(user.balances.values()).reduce((a, b) => a + b, 0)
  }));
  usersWithTotalBalance.sort((a, b) => b.totalBalance - a.totalBalance);
  res.json(usersWithTotalBalance.slice(0, 10));
};

exports.getTopUsersByTransactionVolume = async (req, res) => {
  const agg = await Transaction.aggregate([
    { $group: { _id: '$from', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 0,
        userId: '$user._id',
        name: '$user.name',
        email: '$user.email',
        transactionCount: '$count'
      }
    }
  ]);
  res.json(agg);
};
