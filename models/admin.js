const mongoose = require("mongoose")

const schema_admin = new mongoose.Schema({
    username : {type: String},
    email : {type : String},
    password : {type : String}
})

const featuredAccountSchema = new mongoose.Schema({
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
      unique: true
    }
  });

const admin = mongoose.model('Admin', schema_admin)
const FeaturedAccount = mongoose.model('FeaturedAccount', featuredAccountSchema);

module.exports = admin
module.exports = FeaturedAccount;