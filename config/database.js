const mongoose = require("mongoose");
const { MONGO_URL } = process.env;

exports.connect = () => {
    //Debug
    //console.log("ค่าที่ดึงได้จาก MONGO_URL คือ:", MONGO_URL);

    if (!MONGO_URL) {
        console.error("หาค่า MONGO_URL ไม่เจอ! ตรวจสอบไฟล์ .env ของคุณ");
        process.exit(1);
    }

    mongoose.connect(MONGO_URL,{
        useNewUrlParser: true,
        useUnifiedTopology: true,
        tlsAllowInvalidCertificates: true
    })
    .then(() => {
        console.log("Successfully connected to database");
    })
    .catch((error) => {
        console.log("Error connecting to database");
        console.error(error);
        process.exit(1);
    });
}