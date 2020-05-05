const mongoose = require("mongoose");
const config = require("./appConfig");
const debug = require("debug")("DB");
// Mongoose connection
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1:27017/fsa', { useNewUrlParser: true }).then(async () => {
  debug("DB Connected Successfully!");  
});
