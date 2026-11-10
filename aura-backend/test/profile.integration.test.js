require("dotenv").config();

const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const http = require("node:http");
const { after, before, test } = require("node:test");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const app = require("../src/app");
const { getJwtConfig } = require("../src/config/jwt");

const userId = new mongoose.Types.ObjectId().toString();
const otherUserId = new mongoose.Types.ObjectId().toString();
let server;
let baseUrl;

function tokenFor(id) {
  const { secret, issuer } = getJwtConfig();
  return jwt.sign({ sub: id }, secret, { issuer, expiresIn: "1h", jwtid: randomUUID() });
}

async function request(path, { method = "GET", body, token = tokenFor(userId) } = {}) {
  return fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { "content-type": "application/json" } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
}

before(async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required to run profile integration tests.");
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: `aura_profile_test_${randomUUID().replace(/-/g, "")}`
  });
  server = http.createServer(app);
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}/api/v1/profile`;
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

test("profile routes require authentication and return only the caller's profile", async () => {
  assert.equal((await request("/", { token: null })).status, 401);
  assert.equal((await request("/")).status, 404);

  const created = await request("/", {
    method: "POST",
    body: {
      personal: { ageRange: "25_34", location: { city: "London" } },
      appearance: { skinTone: "medium", undertone: "warm" },
      preferences: { fashionStyles: ["minimalist"], budgetRange: { min: 50, max: 200 } }
    }
  });
  assert.equal(created.status, 201);
  const profile = (await created.json()).data.profile;
  assert.equal(profile.userId, userId);
  assert.equal(profile.personal.location.city, "London");
  assert.ok(profile.createdAt);
  assert.ok(profile.updatedAt);

  const duplicate = await request("/", { method: "POST", body: {} });
  assert.equal(duplicate.status, 409);

  const otherUserProfile = await request("/", {
    token: tokenFor(otherUserId),
    method: "POST",
    body: { personal: { ageRange: "18_24" } }
  });
  assert.equal(otherUserProfile.status, 201);

  const ownProfile = await request("/");
  assert.equal(ownProfile.status, 200);
  assert.equal((await ownProfile.json()).data.profile.personal.ageRange, "25_34");
});

test("section patches and partial updates preserve unrelated profile fields", async () => {
  const [preferences, appearance] = await Promise.all([
    request("/preferences", {
      method: "PATCH",
      body: { preferredBrands: ["AURA Studio"], favouriteColours: ["sage"] }
    }),
    request("/appearance", {
      method: "PATCH",
      body: { eyeColour: "hazel", hairTexture: "wavy" }
    })
  ]);
  assert.equal(preferences.status, 200);
  assert.equal(appearance.status, 200);

  const beforePut = (await (await request("/")).json()).data.profile;
  const put = await request("/", {
    method: "PUT",
    body: {
      skincare: { skinType: "sensitive", skinConcerns: ["user-reported dryness"] }
    }
  });
  assert.equal(put.status, 200);
  const updated = (await put.json()).data.profile;
  assert.equal(updated.appearance.eyeColour, "hazel");
  assert.deepEqual(updated.preferences.preferredBrands, ["AURA Studio"]);
  assert.equal(updated.personal.location.city, "London");
  assert.equal(updated.skincare.skinType, "sensitive");
  assert.ok(updated.updatedAt >= beforePut.updatedAt);

  const cleared = await request("/appearance", {
    method: "PATCH",
    body: { eyeColour: null }
  });
  assert.equal(cleared.status, 200);
  assert.equal((await cleared.json()).data.profile.appearance.eyeColour, undefined);

  const otherProfile = await request("/", { token: tokenFor(otherUserId) });
  assert.equal((await otherProfile.json()).data.profile.personal.ageRange, "18_24");
});

test("profile validation rejects unsupported fields, enums, types, and invalid budgets", async () => {
  const cases = [
    { appearance: { skinTone: "unknown" } },
    { preferences: { fashionStyles: ["not-a-style"] } },
    { skincare: { skinConcerns: "not-an-array" } },
    { personal: { location: { city: 10 } } },
    { preferences: { budgetRange: { min: 500, max: 100 } } },
    { userId: otherUserId },
    { appearance: { unsupported: true } }
  ];

  for (const body of cases) {
    const response = await request("/", { method: "PUT", body });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error.code, "VALIDATION_ERROR");
  }

  for (const body of [{}, { budgetRange: {} }, { favouriteColours: [" "] }]) {
    const response = await request("/preferences", { method: "PATCH", body });
    assert.equal(response.status, 400);
  }

  const inconsistentBudget = await request("/preferences", {
    method: "PATCH",
    body: { budgetRange: { min: 300 } }
  });
  assert.equal(inconsistentBudget.status, 400);
  assert.equal((await inconsistentBudget.json()).error.code, "VALIDATION_ERROR");
});

test("partial upserts remain scoped to the authenticated user", async () => {
  const basicUserId = new mongoose.Types.ObjectId().toString();
  const emptyProfile = await request("/", {
    token: tokenFor(basicUserId),
    method: "POST",
    body: {}
  });
  assert.equal(emptyProfile.status, 201);
  assert.equal((await request("/", { token: tokenFor(basicUserId) })).status, 200);

  const newUserId = new mongoose.Types.ObjectId().toString();
  assert.equal((await request("/", { token: tokenFor(newUserId) })).status, 404);
  const partial = await request("/", {
    method: "PUT",
    token: tokenFor(newUserId),
    body: { haircare: { hairType: "curly_3a", preferences: ["leave-in conditioner"] } }
  });
  assert.equal(partial.status, 200);
  const response = await request("/", { token: tokenFor(otherUserId) });
  const profile = (await response.json()).data.profile;
  assert.equal(profile.haircare, undefined);
  assert.equal(profile.skincare, undefined);
});
