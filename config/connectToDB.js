const mongoose = require('mongoose');
module.exports = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`DB Connected Successfully`)
    }catch(error) {
        console.log(`The Connection Failed To DB`, error)
    }
}