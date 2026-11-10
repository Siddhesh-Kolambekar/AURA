const express = require("express");

const authenticate = require("../middleware/authenticate");
const validateProfile = require("../middleware/validate-profile");
const { create, read, update, updateSection } = require("../controllers/profile.controller");

const router = express.Router();

router.use(authenticate);
router.get("/", read);
router.post("/", validateProfile({ allowEmpty: true }), create);
router.put("/", validateProfile(), update);
router.patch("/preferences", validateProfile({ section: "preferences" }), updateSection("preferences"));
router.patch("/appearance", validateProfile({ section: "appearance" }), updateSection("appearance"));

module.exports = router;
