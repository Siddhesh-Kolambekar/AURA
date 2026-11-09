const express = require("express");

const router = express.Router();

router.get("/", (_request, response) => {
  response.json({ success: true, message: "AURA API is running" });
});

module.exports = router;
