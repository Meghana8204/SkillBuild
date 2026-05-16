require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const batchRoutes = require("./routes/batchRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const reportRoutes = require("./routes/reportRoutes");

const {
  notFound,
  errorHandler,
} = require("./middleware/errorMiddleware");

const app = express();

/*
=================================
ALLOWED ORIGINS
=================================
*/

const allowedOrigins = [
  "http://localhost:5173",
  "https://skillbuild-ce3h.onrender.com",
];

/*
=================================
CORS CONFIGURATION
=================================
*/

const corsOptions = {
  origin: function (origin, callback) {

    // Allow requests without origin
    // (Postman, mobile apps)

    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
};

app.use(cors(corsOptions));

app.options("*", cors(corsOptions));

/*
=================================
SECURITY
=================================
*/

app.use(helmet());

/*
=================================
BODY PARSER
=================================
*/

app.use(express.json({ limit: "10kb" }));

app.use(express.urlencoded({ extended: true }));

/*
=================================
LOGGER
=================================
*/

if (process.env.NODE_ENV !== "test") {
  app.use(
    morgan(
      process.env.NODE_ENV === "production"
        ? "combined"
        : "dev"
    )
  );
}

/*
=================================
HEALTH ROUTE
=================================
*/

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "SkillBridge API",
  });
});

/*
=================================
API ROUTES
=================================
*/

app.use("/api/auth", authRoutes);

app.use("/api/batches", batchRoutes);

app.use("/api/sessions", sessionRoutes);

app.use("/api/attendance", attendanceRoutes);

app.use("/api", reportRoutes);

/*
=================================
ERROR HANDLERS
=================================
*/

app.use(notFound);

app.use(errorHandler);

module.exports = app;