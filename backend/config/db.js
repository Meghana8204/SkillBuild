const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Check env variable
    if (!process.env.MONGO_URI) {
      throw new Error("❌ MONGO_URI is missing in environment variables");
    }

    mongoose.set("strictQuery", true);

    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

  } catch (error) {
    console.error("❌ MongoDB connection failed:");
    console.error(error); // FULL ERROR (important)

    process.exit(1); // stop app if DB fails
  }
};

module.exports = connectDB;