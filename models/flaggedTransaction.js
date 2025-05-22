const mongoose = require('mongoose');

const flaggedTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: false },
  reason: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FlaggedTransaction', flaggedTransactionSchema);
