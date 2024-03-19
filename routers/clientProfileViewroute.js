const express = require("express");

const profileView = new express.Router();

//Importing the views model as Views
const Views = require("../models/profile_views");

profileView.post("/profiles/:profileId/view", async (req, res) => {
  const { profileId } = req.params;
  const { viewerUserId } = req.body;

  try {
    // Create a new profile view document
    const profileView = new ProfileView({
      viewerUserId,
      profileId,
    });

    // Save the profile view to the database
    await profileView.save();

    res.status(200).json({ message: "Profile view tracked successfully." });
  } catch (error) {
    console.error("Failed to track profile view:", error);
    res.status(500).json({ error: "Failed to track profile view." });
  }
});

module.exports = profileView;
