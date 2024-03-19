//importing mongo DB as mongoose
const mongoose = require ("mongoose")

//Establishing Database connection

mongoose.connect("mongodb://127.0.0.1:27017/Lami",{
    useNewUrlParser : true,
    useUnifiedTopology : true,
})