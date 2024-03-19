const mongoose = require("mongoose");

const schema_client = new mongoose.Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  gender: { type: String, enum: ["male", "female", "other"],required: true, },
  country: { type: String },
  phone: { type: String },
  religion: { type: String },
  // password: { type: String, required: true },
  _age: { type: Number },
  image: { type: String },
  maritalStatus: { type: String },
  livesIn: { type: String },
  birthDate: { type: Date },
  grewUpIn: { type: String },
   preferences: [{
    minAge:{type: Number, default: 20},
    maxAge: { type: Number, default: 40 },
    religion: { type: String, default: 'Any' },
    location: { type: String, default: 'Any' },
    dietPreferences: [{ type: String, default: [] }],
    minHeight: { type: Number, default: 150 },
    maxHeight: { type: Number, default: 200 },
    minWeight: { type: Number, default: 50 },
    maxWeight: { type: Number, default: 100 },
  }],
  college: { type: String },
  secondaryImages: [{ type: String, required:false }], // Array of secondary images
  verified: { type: Boolean, default: false },
  role: { type: String, enum: ['basic', 'premium'], default: 'basic' },
  // age: { type: Number, default: 30 },
  isTermAndCondition: {type: Boolean, default: false, required:true},
  fcmToken:{type:String}
  
});

//To calculate user age
schema_client.virtual("age").get(function () {
  if (!this.birthDate) {
    return undefined;
  }
  const currentDate = new Date();
  const birthDate = new Date(this.birthDate);
  const ageInMilliseconds = currentDate - birthDate;
  const ageInYears = Math.floor(
    ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25)
  );
  return ageInYears;
});

// Virtual property to set _age
schema_client.virtual("userAge").get(function () {
  return this.age; // Using existing 'age' virtual property
});

// Virtual field to check if the client is featured
schema_client.virtual("featured", {
  ref: "FeaturedAccount",
  localField: "_id",
  foreignField: "client",
  justOne: true,
});

const connectionRequestSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
  },
  isFriend: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  
}, { timestamps: { createdAt:  "createdAt", updatedAt:"updatedAt"} });

// Create a message schema and model

const Clients = mongoose.model("Client", schema_client);
const ConnectionRequests = mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);

module.exports = {
  Clients,
  ConnectionRequests,
};