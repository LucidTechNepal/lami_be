const express = require("express");

const admin_route = new express.Router();

//Import Admin schema as Admin
const Admin = require("../models/admin");

//Import client model
const {Clients} = require("../models/client");

//Import FeaturedAccount model

const FeaturedAccount = require("../models/admin")

//Importing Bcrypt for the password encription
const bcrypt = require("bcryptjs");

admin_route.post("/adminSignup", function (req, res) {
  console.log(req,"request")
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  bcrypt.hash(password, 12, function (err, hash12) {
    var admin_data = new Admin({
      username: username,
      email: email,
      password: hash12,
    });
    console.log("From admin signup");

    admin_data
      .save()
      .then(function () {
        res.status(201).json({ message: "Admin Registration Success" });
      })
      .catch(function (e) {
        res.status().json({ message: e });
      });
  });
});

admin_route.post("/adminLogin", function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  Admin.findOne({ email: email }).then(function (data) {
    if (data == null) {
      return res.status(403).json({ message: "Invalid Credentials" });
    }

    bcrypt.compare(password, data.password, function (err, result) {
      if (result === false) {
        return res.status(403).json({ message: "Credentaials donot match" });
      }
      res.status(200).json({ message: "Success on LOgin" });
    });
  });
});

admin_route.get("/user-counts", async (req, res) => {
  try {
    const totalCount = await Clients.countDocuments(); // Total number of users
    const maleCount = await Clients.countDocuments({ gender: "male" }); // Total number of male users
    const femaleCount = await Clients.countDocuments({ gender:"female" }); // Total number of female users

    const result = {
      totalCount,
      maleCount,
      femaleCount,
    };

    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while retrieving user counts." });
  }
});


//Route for featured Account

admin_route.post('/featuredAccount', async (req, res) => {
  const { clientId } = req.body;

  try {
    // Check if the client already exists in the featured accounts
    const existingFeaturedAccount = await FeaturedAccount.findOne({ client: clientId });
    if (existingFeaturedAccount) {
      return res.status(400).json({ message: 'Client is already featured' });
    }

    // Create a new featured account
    const featuredAccount = new FeaturedAccount({ client: clientId });
    await featuredAccount.save();

    res.json(featuredAccount);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get all featured accounts
admin_route.get('/showFeaturedAccount', async (req, res) => {
  try {
    const featuredAccounts = await FeaturedAccount.find().populate('client');
    res.json(featuredAccounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Remove a client from the featured accounts
admin_route.delete('/DeletefeaturedAccount/:id', async (req, res) => {


  try {
    // Find and remove the featured account by ID
    const deletedFeaturedAccount = await FeaturedAccount.findByIdAndDelete(req.params.id);

    if (!deletedFeaturedAccount) {
      return res.status(404).json({ message: 'Featured account not found' });
    }

    res.json({ message: 'Featured account removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = admin_route;
