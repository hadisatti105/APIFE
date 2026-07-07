require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Health Check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MarketWave RTB API is running"
  });
});

// Submit Lead
app.post("/api/submit", async (req, res) => {
  try {
    const { caller_id, zipcode, state } = req.body;

    // Validation
    if (!caller_id) {
      return res.status(400).json({
        success: false,
        message: "Caller ID is required"
      });
    }

    const requestBody = {
      key: process.env.MARKETWAVE_KEY,
      caller_id: caller_id,
      caller_state: state || "",
      caller_zip: zipcode || ""
    };

    console.log("========== REQUEST ==========");
    console.log(requestBody);
    console.log("=============================");

    const response = await axios.post(
      "https://api.marketwave.io/webhooks/rtb/ping",
      requestBody,
      {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 15000
      }
    );

    console.log("========== RESPONSE ==========");
    console.log(response.data);
    console.log("==============================");

    res.json({
      success: true,
      marketwave: response.data
    });

  } catch (error) {

    console.log("========== ERROR ==========");

    if (error.response) {
      console.log(error.response.data);

      return res.status(error.response.status).json({
        success: false,
        error: error.response.data
      });
    }

    console.log(error.message);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("");
  console.log("=========================================");
  console.log(" MarketWave RTB Server Started");
  console.log("=========================================");
  console.log(` Running on http://localhost:${PORT}`);
  console.log(` API Endpoint: http://localhost:${PORT}/api/submit`);
  console.log("=========================================");
});