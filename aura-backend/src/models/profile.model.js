const mongoose = require("mongoose");

const AGE_RANGES = ["under_18", "18_24", "25_34", "35_44", "45_54", "55_plus"];
const GENDERS = ["woman", "man", "non_binary", "prefer_not_to_say"];
const SKIN_TONES = ["very_fair", "fair", "light", "medium", "olive", "tan", "deep"];
const UNDERTONES = ["cool", "neutral", "warm", "olive"];
const EYE_COLOURS = ["amber", "blue", "brown", "gray", "green", "hazel", "other"];
const HAIR_COLOURS = ["black", "brown", "blonde", "red", "gray", "white", "other"];
const HAIR_LENGTHS = ["bald", "very_short", "short", "medium", "long", "very_long"];
const HAIR_TEXTURES = ["straight", "wavy", "curly", "coily"];
const FACE_SHAPES = ["oval", "round", "square", "heart", "diamond", "oblong"];
const FASHION_STYLES = [
  "casual",
  "classic",
  "bohemian",
  "minimalist",
  "streetwear",
  "formal",
  "sporty",
  "vintage",
  "romantic",
  "edgy"
];
const SKIN_TYPES = ["normal", "dry", "oily", "combination", "sensitive"];
const HAIR_TYPES = [
  "straight",
  "wavy_2a",
  "wavy_2b",
  "wavy_2c",
  "curly_3a",
  "curly_3b",
  "curly_3c",
  "coily_4a",
  "coily_4b",
  "coily_4c"
];

const locationSchema = new mongoose.Schema(
  {
    city: { type: String, trim: true, maxlength: 100 },
    region: { type: String, trim: true, maxlength: 100 },
    country: { type: String, trim: true, maxlength: 100 },
    postalCode: { type: String, trim: true, maxlength: 20 }
  },
  { _id: false, strict: "throw" }
);

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true
    },
    personal: {
      ageRange: { type: String, enum: AGE_RANGES },
      gender: { type: String, enum: GENDERS },
      stylePreferences: { type: [String], default: undefined },
      location: { type: locationSchema }
    },
    appearance: {
      skinTone: { type: String, enum: SKIN_TONES },
      undertone: { type: String, enum: UNDERTONES },
      eyeColour: { type: String, enum: EYE_COLOURS },
      hairColour: { type: String, enum: HAIR_COLOURS },
      hairLength: { type: String, enum: HAIR_LENGTHS },
      hairTexture: { type: String, enum: HAIR_TEXTURES },
      faceShape: { type: String, enum: FACE_SHAPES }
    },
    preferences: {
      fashionStyles: { type: [String], enum: FASHION_STYLES, default: undefined },
      favouriteColours: { type: [String], default: undefined },
      preferredBrands: { type: [String], default: undefined },
      budgetRange: {
        min: { type: Number, min: 0 },
        max: { type: Number, min: 0 }
      }
    },
    skincare: {
      skinType: { type: String, enum: SKIN_TYPES },
      skinConcerns: { type: [String], default: undefined },
      productPreferences: { type: [String], default: undefined }
    },
    haircare: {
      hairType: { type: String, enum: HAIR_TYPES },
      hairConcerns: { type: [String], default: undefined },
      preferences: { type: [String], default: undefined }
    }
  },
  { timestamps: true, strict: "throw" }
);

module.exports = mongoose.model("Profile", profileSchema);
