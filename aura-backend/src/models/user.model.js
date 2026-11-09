const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[1-9]\d{1,14}$/;
const PASSWORD_SALT_ROUNDS = 12;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: [EMAIL_PATTERN, "Enter a valid email address."]
    },
    password: {
      type: String,
      required() {
        return this.authProvider === "email";
      },
      minlength: 8,
      validate: {
        validator(password) {
          return !password || Buffer.byteLength(password, "utf8") <= 72;
        },
        message: "Password must not exceed 72 bytes."
      },
      select: false
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator(phone) {
          return !phone || PHONE_PATTERN.test(phone);
        },
        message: "Enter a valid phone number in international format."
      }
    },
    authProvider: {
      type: String,
      required: true,
      default: "email",
      lowercase: true,
      trim: true,
      maxlength: 40,
      match: [/^[a-z][a-z0-9_-]*$/, "Enter a valid authentication provider."]
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isPhoneVerified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password") || !this.password) {
    return;
  }

  this.password = await bcrypt.hash(this.password, PASSWORD_SALT_ROUNDS);
});

userSchema.pre(
  ["findOneAndUpdate", "updateOne", "updateMany", "findOneAndReplace", "replaceOne"],
  async function hashPasswordInUpdate() {
    const update = this.getUpdate();

    if (!update) {
      return;
    }

    if (Array.isArray(update)) {
      throw new Error("User update pipelines are not supported; update documents with save().");
    }

    for (const [operator, fields] of Object.entries(update)) {
      if (!operator.startsWith("$")) {
        if (operator === "password") {
          update.password = await hashUpdatedPassword(fields);
        }
        continue;
      }

      if (operator === "$set" || operator === "$setOnInsert") {
        for (const [path, value] of Object.entries(fields)) {
          if (path === "password") {
            fields.password = await hashUpdatedPassword(value);
          } else if (path.startsWith("password.")) {
            throw new Error("Password must be updated as a whole value.");
          }
        }
        continue;
      }

      if (operator === "$unset") {
        continue;
      }

      if (operator === "$rename") {
        if (Object.values(fields).some((path) => path === "password")) {
          throw new Error("Password cannot be set with $rename.");
        }
        continue;
      }

      if (Object.keys(fields).some((path) => path === "password" || path.startsWith("password."))) {
        throw new Error("Password must be updated with $set so it can be hashed.");
      }
    }

    this.setOptions({ runValidators: true });
  }
);

async function hashUpdatedPassword(password) {
  if (
    typeof password !== "string" ||
    password.length < 8 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    throw new Error("Password updates must be at least 8 characters and no longer than 72 bytes.");
  }

  return bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
}

userSchema.methods.comparePassword = function comparePassword(password) {
  if (!this.password) {
    throw new Error("Password is not selected. Query with .select('+password') to compare it.");
  }

  return bcrypt.compare(password, this.password);
};

function removePassword(_document, result) {
  delete result.password;
  return result;
}

userSchema.set("toJSON", { transform: removePassword });
userSchema.set("toObject", { transform: removePassword });

module.exports = mongoose.model("User", userSchema);
