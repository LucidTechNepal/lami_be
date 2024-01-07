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
  birthDate: { type: Date ,required: true },
  grewUpIn: { type: String },
  dietPreference: { type: String },
  profession: { type: String },
  annualIncome: { type: String },
  worksAt: { type: String },
  highestQualification: { type: String },
  college: { type: String },
  secondaryImages: [{ type: String }], // Array of secondary images
  verified: { type: Boolean, default: false },
  role: { type: String, enum: ["basic", "premium"], default:"basic"}
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