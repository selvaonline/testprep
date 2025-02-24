// Consider removing this file if using server/index.ts exclusively.
const express = require("express");
const app = express();
const errorHandler = require("./middleware/errorHandler");

app.use(express.json()); // Add this before your route handlers

// ...existing routes...

app.use(errorHandler); // Add this after all your routes

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
