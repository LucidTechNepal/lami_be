//importing mongo DB as mongoose
const mongoose = require ("mongoose")

//Establishing Database connection

mongoose.connect(process.env.DATABASE_URL,{
    useNewUrlParser : true,
    useUnifiedTopology : true,
})