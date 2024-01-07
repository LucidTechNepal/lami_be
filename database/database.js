//importing mongo DB as mongoose
const mongoose = require ("mongoose")

//Establishing Database connection

mongoose.connect("mongodb+srv://admin:Admin@cluster0.jmkww.mongodb.net/lami_dev",{
    useNewUrlParser : true,
    useUnifiedTopology : true,
})