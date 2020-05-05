const mongoose = require("mongoose");

const filledOrderSchema = new mongoose.Schema({
  transactions: { 
      type: Array, default: [] 
   }
});
mongoose.connect(
  'mongodb://127.0.0.1:27017/COSS',
   { useNewUrlParser: true },
   async err => {
     if (err) {
       console.log(err);
     } else {
       console.log("DB Connected!");
       const dbUpdate = await mongoose.model("ICO_Transaction", filledOrderSchema).create({transactions: ['ONE']});
       console.log(dbUpdate);

     }
   }
 );

module.exports = mongoose.model("ICO_Transaction", filledOrderSchema);
