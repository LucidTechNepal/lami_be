const jwt = require("jsonwebtoken");
const { Clients } = require("../models/client");
const Admin = require("../models/admin");

// Middleware for verifying clients
module.exports.verifyClient = function (req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const data = jwt.verify(token, "anysecretkey");

    // Clients.findById({_id: data.clientID })
    // .then(function(result) {
    //   req.clientData = result;
    //   next();
    // })
    // .catch(function(e){
    //     res.status(401).json({error:e})
    // })

    const id = data.clientID;
    Clients.findById({ _id: id })
      .then(function (data) {
        req.user = data._id;
        next();
      })
      .catch(function (e) {
        res.status(500).json({ message: e });
      });
  } catch (e) {
    console.log(e);
    res.status(401).json({ error: e });
  }
};

// Middleware for verifying admins
module.exports.verifyAdmin = function (req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const data = jwt.verify(token, "anysecretkey");

    Admin.findOne({ _id: data.adminID })
      .then(function (result) {
        req.userData = result;
        next();
      })
      .catch(function (e) {
        return res.status(401).json({ error: "Unauthorized" });
      });
  } catch (e) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

// for socket authencation
module.exports.socketAuthencation = async function (socket, next) {
  const token = socket.handshake.headers.token;
  if (!token) {
    socket.emit("authentication-failed", "No token provided");

    return next(new Error("Authentication failed: No token provided"));
  }
  try {
    const decoded = jwt.verify(token, "anysecretkey");
    const userId = decoded.clientID;
    const client = await Clients.findById({_id:userId});
    socket.userId = client._id;
    return next();
  } catch (error) {
    socket.emit("authentication-failed", error);
    return next(new Error("Authentication failed: Invalid token"));
  }
};
