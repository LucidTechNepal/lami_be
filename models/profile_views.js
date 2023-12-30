const mongoose = require("mongoose");

const profileViewSchema = new mongoose.Schema({
  viewerUserId: { type: mongoose.Schema.Types.ObjectId, required: true },
  profileId: { type: mongoose.Schema.Types.ObjectId, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Create the ProfileView model
const ProfileView = mongoose.model("ProfileView", profileViewSchema);

module.exports = ProfileView;
