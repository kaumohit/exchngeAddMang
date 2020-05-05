var mongoose	= require('mongoose');
var Schema		= mongoose.Schema;

var withdrawalSchema = new Schema({
    txID: String,
    txHashSubmit: {
      type: String
    },
    txHashConfirm: {
      type: String
    },
    from: String,
    to: String,
    value: Number,
    //fee: Number,
    coin: String,
    requestCount: {
      type: Number,
      default: 0
    },
    isUserNotified: {
      type: Boolean,
      default: false
    },
    statusConfirm: {
      type: Number,
      enum: [1, 0, -1]
    },
    createdAtSubmit: {
      type: Date,
      default: Date.now()
    },
    updatedAtSubmit: {
      type: Date,
      default: Date.now()
    },
    createdAtConfirm: {
      type: Date,
      default: Date.now()
    },
    updatedAtConfirm: {
      type: Date,
      default: Date.now()
    },
    statusSubmit: {
      type: Number,
      enum: [1, 0, -1]
    }
});

var Withdrawal = mongoose.model('withdrawal', withdrawalSchema);
module.exports = Withdrawal;