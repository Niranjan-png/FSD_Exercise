const mangoose = require("mongoose");

const connectDB = async () => {
    try {
        await
        mangoose.connect(process.env.MONGODB_URL);
        console.log("Mongodb Connected");
    }catch(error){
        console.error("Mongodb not connecte:",error.message);
        process.exit(1);
    }
};
module.exports = connectDB;