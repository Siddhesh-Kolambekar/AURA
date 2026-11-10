const PROFILE_FIELDS = {
  personal: {
    ageRange: { type: "enum", values: ["under_18", "18_24", "25_34", "35_44", "45_54", "55_plus"] },
    gender: { type: "enum", values: ["woman", "man", "non_binary", "prefer_not_to_say"] },
    stylePreferences: { type: "stringArray", maxItems: 20, maxLength: 80 },
    location: {
      type: "object",
      fields: {
        city: { type: "string", maxLength: 100 },
        region: { type: "string", maxLength: 100 },
        country: { type: "string", maxLength: 100 },
        postalCode: { type: "string", maxLength: 20 }
      }
    }
  },
  appearance: {
    skinTone: { type: "enum", values: ["very_fair", "fair", "light", "medium", "olive", "tan", "deep"] },
    undertone: { type: "enum", values: ["cool", "neutral", "warm", "olive"] },
    eyeColour: { type: "enum", values: ["amber", "blue", "brown", "gray", "green", "hazel", "other"] },
    hairColour: { type: "enum", values: ["black", "brown", "blonde", "red", "gray", "white", "other"] },
    hairLength: { type: "enum", values: ["bald", "very_short", "short", "medium", "long", "very_long"] },
    hairTexture: { type: "enum", values: ["straight", "wavy", "curly", "coily"] },
    faceShape: { type: "enum", values: ["oval", "round", "square", "heart", "diamond", "oblong"] }
  },
  preferences: {
    fashionStyles: {
      type: "enumArray",
      values: ["casual", "classic", "bohemian", "minimalist", "streetwear", "formal", "sporty", "vintage", "romantic", "edgy"],
      maxItems: 20
    },
    favouriteColours: { type: "stringArray", maxItems: 30, maxLength: 40 },
    preferredBrands: { type: "stringArray", maxItems: 50, maxLength: 100 },
    budgetRange: {
      type: "object",
      fields: {
        min: { type: "number", min: 0, max: 1000000 },
        max: { type: "number", min: 0, max: 1000000 }
      }
    }
  },
  skincare: {
    skinType: { type: "enum", values: ["normal", "dry", "oily", "combination", "sensitive"] },
    skinConcerns: { type: "stringArray", maxItems: 30, maxLength: 200 },
    productPreferences: { type: "stringArray", maxItems: 30, maxLength: 200 }
  },
  haircare: {
    hairType: {
      type: "enum",
      values: ["straight", "wavy_2a", "wavy_2b", "wavy_2c", "curly_3a", "curly_3b", "curly_3c", "coily_4a", "coily_4b", "coily_4c"]
    },
    hairConcerns: { type: "stringArray", maxItems: 30, maxLength: 200 },
    preferences: { type: "stringArray", maxItems: 30, maxLength: 200 }
  }
};

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateValue(value, definition, path, errors) {
  if (definition.type === "object") {
    if (!isPlainObject(value)) {
      errors.push(`${path} must be an object.`);
      return;
    }
    validateFields(value, definition.fields, path, errors);
    if (Object.keys(value).length === 0) {
      errors.push(`${path} must contain at least one supported field.`);
    }
    return;
  }

  if (definition.type === "enum") {
    if (typeof value !== "string" || !definition.values.includes(value)) {
      errors.push(`${path} must be one of: ${definition.values.join(", ")}.`);
    }
    return;
  }

  if (definition.type === "number") {
    if (typeof value !== "number" || !Number.isFinite(value) || value < definition.min || value > definition.max) {
      errors.push(`${path} must be a number between ${definition.min} and ${definition.max}.`);
    }
    return;
  }

  if (definition.type === "string") {
    if (
      typeof value !== "string" ||
      value.trim().length === 0 ||
      value.trim().length > definition.maxLength
    ) {
      errors.push(`${path} must be a non-empty string no longer than ${definition.maxLength} characters.`);
    }
    return;
  }

  if (
    !Array.isArray(value) ||
    value.length > definition.maxItems ||
    value.some(
      (item) =>
        typeof item !== "string" ||
        item.trim().length === 0 ||
        item.trim().length > definition.maxLength
    )
  ) {
    errors.push(`${path} must be an array of up to ${definition.maxItems} non-empty strings.`);
    return;
  }

  if (definition.type === "enumArray" && value.some((item) => !definition.values.includes(item))) {
    errors.push(`${path} contains an unsupported value. Supported values: ${definition.values.join(", ")}.`);
  }
}

function validateFields(body, definitions, prefix, errors) {
  for (const [key, value] of Object.entries(body)) {
    const definition = definitions[key];
    const path = prefix ? `${prefix}.${key}` : key;

    if (!definition) {
      errors.push(`${path} is not supported.`);
      continue;
    }

    validateValue(value, definition, path, errors);
  }
}

function validateProfile({ section, allowEmpty = false } = {}) {
  return (request, response, next) => {
    const body = request.body;
    const errors = [];

    if (!isPlainObject(body)) {
      errors.push("Request body must be an object.");
    } else {
      const definitions = section
        ? PROFILE_FIELDS[section]
        : Object.fromEntries(
            Object.entries(PROFILE_FIELDS).map(([name, fields]) => [
              name,
              { type: "object", fields }
            ])
          );
      validateFields(body, definitions, "", errors);

      if (!allowEmpty && Object.keys(body).length === 0) {
        errors.push("Request body must contain at least one field to update.");
      }
    }

    const budget = section === "preferences" ? body?.budgetRange : body?.preferences?.budgetRange;
    if (budget && typeof budget.min === "number" && typeof budget.max === "number" && budget.min > budget.max) {
      errors.push("preferences.budgetRange.min must not exceed preferences.budgetRange.max.");
    }

    if (errors.length > 0) {
      return response.status(400).json({
        success: false,
        message: "Request validation failed",
        error: { code: "VALIDATION_ERROR", details: errors }
      });
    }

    return next();
  };
}

module.exports = validateProfile;
