const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log("MongoDB connected successfully");

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 SkillBridge API running on port ${PORT}`);
    });

  } catch (error) {
    // FULL error (not just message)
    console.error("❌ Failed to start SkillBridge API:");
    console.error(error); // 👈 important (prints full stack)

    process.exit(1);
  }
};

// Handle unexpected crashes
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

startServer();