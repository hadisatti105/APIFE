const axios = require("axios");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { caller_id, zipcode, state } = req.body;

    const response = await axios.post(
      "https://api.marketwave.io/webhooks/rtb/ping",
      {
        key: process.env.MARKETWAVE_KEY,
        caller_id,
        caller_state: state,
        caller_zip: zipcode,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json(
      error.response?.data || {
        error: error.message,
      }
    );
  }
};