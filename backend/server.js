const express = require("express");
const cors = require("cors");
const fs = require("fs/promises");
const path = require("path");

let mongoose = null;
try {
  mongoose = require("mongoose");
} catch (_error) {
  mongoose = null;
}

const app = express();
const PORT = process.env.PORT || 5000;
const MAX_PARTICIPANT_REGISTRATIONS = 600;
const MAX_ADMIN_ACCOUNTS = 6;
const MAX_JUDGE_ACCOUNTS = 2;
const MONGO_URI = process.env.MONGODB_URI;
const USE_MONGO = Boolean(MONGO_URI);

const DATA_DIR = path.join(__dirname, "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : "*",
  })
);
app.use(express.json({ limit: "5mb" }));

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function nextId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

function sanitizeDoc(doc) {
  if (!doc) return doc;
  const clean = { ...doc };
  delete clean._id;
  delete clean.__v;
  return clean;
}

function sanitizeTeam(team) {
  if (!team) return team;
  const clean = sanitizeDoc(team);
  delete clean.password;
  delete clean.emailKey;
  return clean;
}

function sanitizeAccount(account) {
  if (!account) return account;
  const clean = sanitizeDoc(account);
  delete clean.password;
  delete clean.emailKey;
  return clean;
}

function mapMembers(members) {
  if (!Array.isArray(members)) return [];
  return members.map((m) => ({
    name: String(m?.name || "").trim(),
    phone: String(m?.phone || "").trim(),
    email: String(m?.email || "").trim(),
  }));
}

async function ensureFileStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(STORE_FILE);
  } catch (_error) {
    const initialState = {
      teams: [],
      contactMessages: [],
      adminAccounts: [],
      judgeAccounts: [],
    };
    await fs.writeFile(STORE_FILE, JSON.stringify(initialState, null, 2), "utf8");
  }
}

async function readStore() {
  const raw = await fs.readFile(STORE_FILE, "utf8");
  return JSON.parse(raw);
}

async function writeStore(nextState) {
  await fs.writeFile(STORE_FILE, JSON.stringify(nextState, null, 2), "utf8");
}

let TeamModel;
let ContactMessageModel;
let AdminAccountModel;
let JudgeAccountModel;

async function initMongo() {
  if (!USE_MONGO) return;
  if (!mongoose) {
    throw new Error("MONGODB_URI is set but mongoose is not installed. Run: npm install");
  }

  await mongoose.connect(MONGO_URI);

  const memberSchema = new mongoose.Schema(
    {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
    },
    { _id: false }
  );

  const teamSchema = new mongoose.Schema(
    {
      id: { type: Number, unique: true, required: true, index: true },
      teamName: { type: String, required: true },
      teamNumber: { type: String, default: "" },
      email: { type: String, required: true },
      emailKey: { type: String, required: true, index: true },
      password: { type: String, required: true },
      members: { type: [memberSchema], default: [] },
      productName: { type: String, default: "" },
      poster: { type: mongoose.Schema.Types.Mixed, default: null },
      round1: {
        avgScore: { type: Number, default: 0 },
        selected: { type: Boolean, default: false },
      },
      round2: {
        avgScore: { type: Number, default: 0 },
        selected: { type: Boolean, default: false },
      },
      scores: { type: mongoose.Schema.Types.Mixed, default: {} },
      createdAt: { type: String, default: () => new Date().toISOString() },
    },
    { minimize: false }
  );

  const contactSchema = new mongoose.Schema({
    id: { type: Number, unique: true, required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    subject: { type: String, default: "" },
    message: { type: String, required: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
  });

  const accountSchema = new mongoose.Schema({
    id: { type: Number, unique: true, required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    emailKey: { type: String, required: true, index: true },
    password: { type: String, required: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
  });

  TeamModel = mongoose.models.Team || mongoose.model("Team", teamSchema);
  ContactMessageModel =
    mongoose.models.ContactMessage || mongoose.model("ContactMessage", contactSchema);
  AdminAccountModel = mongoose.models.AdminAccount || mongoose.model("AdminAccount", accountSchema);
  JudgeAccountModel = mongoose.models.JudgeAccount || mongoose.model("JudgeAccount", accountSchema);
}

async function bootstrapData() {
  if (USE_MONGO) {
    const [teams, contactMessages, adminAccounts, judgeAccounts] = await Promise.all([
      TeamModel.find({}).lean(),
      ContactMessageModel.find({}).sort({ createdAt: -1 }).lean(),
      AdminAccountModel.find({}).lean(),
      JudgeAccountModel.find({}).lean(),
    ]);

    return {
      teams: teams.map(sanitizeTeam),
      contactMessages: contactMessages.map(sanitizeDoc),
      adminAccounts: adminAccounts.map(sanitizeAccount),
      judgeAccounts: judgeAccounts.map(sanitizeAccount),
    };
  }

  const store = await readStore();
  return {
    teams: (store.teams || []).map(sanitizeTeam),
    contactMessages: store.contactMessages || [],
    adminAccounts: (store.adminAccounts || []).map(sanitizeAccount),
    judgeAccounts: (store.judgeAccounts || []).map(sanitizeAccount),
  };
}

app.get("/api/health", async (_req, res) => {
  res.json({
    ok: true,
    service: "adzap-backend",
    storage: USE_MONGO ? "mongodb" : "file",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/bootstrap", async (_req, res, next) => {
  try {
    const data = await bootstrapData();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

app.post("/api/contact-messages", async (req, res, next) => {
  try {
    const { name, email, phone = "", subject = "", message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ message: "name, email, and message are required" });
    }

    const newMessage = {
      id: nextId(),
      name: String(name).trim(),
      email: String(email).trim(),
      phone: String(phone || "").trim(),
      subject: String(subject || "").trim(),
      message: String(message).trim(),
      createdAt: new Date().toISOString(),
    };

    if (USE_MONGO) {
      const created = await ContactMessageModel.create(newMessage);
      return res.status(201).json(sanitizeDoc(created.toObject()));
    }

    const store = await readStore();
    store.contactMessages.unshift(newMessage);
    await writeStore(store);
    res.status(201).json(newMessage);
  } catch (error) {
    next(error);
  }
});

app.post("/api/teams/register", async (req, res, next) => {
  try {
    const {
      teamName,
      teamNumber = "",
      email,
      password,
      members = [],
      productName = "",
      poster = null,
    } = req.body || {};
    if (!teamName || !email || !password) {
      return res.status(400).json({ message: "teamName, email, and password are required" });
    }

    const emailKey = normalizeEmail(email);
    const sanitizedTeam = {
      id: nextId(),
      teamName: String(teamName).trim(),
      teamNumber: String(teamNumber || "").trim(),
      email: String(email).trim(),
      emailKey,
      password: String(password).trim(),
      members: mapMembers(members),
      productName: String(productName || "").trim(),
      poster,
      round1: { avgScore: 0, selected: false },
      round2: { avgScore: 0, selected: false },
      scores: {},
      createdAt: new Date().toISOString(),
    };

    if (USE_MONGO) {
      const [teamCount, duplicate] = await Promise.all([
        TeamModel.countDocuments(),
        TeamModel.findOne({ emailKey }).lean(),
      ]);

      if (teamCount >= MAX_PARTICIPANT_REGISTRATIONS) {
        return res.status(409).json({
          message: `Registrations are closed. Maximum ${MAX_PARTICIPANT_REGISTRATIONS} participants reached.`,
        });
      }
      if (duplicate) {
        return res.status(409).json({
          message: "This email is already registered. Please use participant login.",
        });
      }

      const created = await TeamModel.create(sanitizedTeam);
      return res.status(201).json({ success: true, team: sanitizeTeam(created.toObject()) });
    }

    const store = await readStore();
    if (store.teams.length >= MAX_PARTICIPANT_REGISTRATIONS) {
      return res.status(409).json({
        message: `Registrations are closed. Maximum ${MAX_PARTICIPANT_REGISTRATIONS} participants reached.`,
      });
    }
    const duplicate = store.teams.find((team) => normalizeEmail(team.email) === emailKey);
    if (duplicate) {
      return res.status(409).json({
        message: "This email is already registered. Please use participant login.",
      });
    }

    store.teams.push(sanitizedTeam);
    await writeStore(store);
    res.status(201).json({ success: true, team: sanitizeTeam(sanitizedTeam) });
  } catch (error) {
    next(error);
  }
});

app.put("/api/teams", async (req, res, next) => {
  try {
    const { teams } = req.body || {};
    if (!Array.isArray(teams)) {
      return res.status(400).json({ message: "teams must be an array" });
    }

    const normalizedTeams = teams.map((team) => ({
      ...sanitizeDoc(team),
      id: Number(team.id) || nextId(),
      teamName: String(team.teamName || "").trim(),
      teamNumber: String(team.teamNumber || "").trim(),
      email: String(team.email || "").trim(),
      emailKey: normalizeEmail(team.email),
      password: String(team.password || ""),
      members: mapMembers(team.members),
      productName: String(team.productName || "").trim(),
      poster: team.poster || null,
      round1: team.round1 || { avgScore: 0, selected: false },
      round2: team.round2 || { avgScore: 0, selected: false },
      scores: team.scores || {},
      createdAt: team.createdAt || new Date().toISOString(),
    }));

    if (USE_MONGO) {
      await TeamModel.deleteMany({});
      if (normalizedTeams.length > 0) {
        await TeamModel.insertMany(normalizedTeams, { ordered: false });
      }
      return res.json({ success: true, teams: normalizedTeams.map(sanitizeTeam) });
    }

    const store = await readStore();
    store.teams = normalizedTeams;
    await writeStore(store);
    res.json({ success: true, teams: normalizedTeams.map(sanitizeTeam) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/participant/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const emailKey = normalizeEmail(email);
    const passwordKey = String(password || "").trim();

    let team;
    if (USE_MONGO) {
      team = await TeamModel.findOne({ emailKey, password: passwordKey }).lean();
    } else {
      const store = await readStore();
      team = store.teams.find(
        (t) => normalizeEmail(t.email) === emailKey && String(t.password) === passwordKey
      );
    }

    if (!team) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      user: {
        teamId: team.id,
        teamName: team.teamName,
        email: team.email,
        role: "participant",
      },
      team: sanitizeTeam(team),
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/admin/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, and password are required" });
    }

    const emailKey = normalizeEmail(email);
    const admin = {
      id: nextId(),
      name: String(name).trim(),
      email: String(email).trim(),
      emailKey,
      password: String(password).trim(),
      createdAt: new Date().toISOString(),
    };

    if (USE_MONGO) {
      const [adminCount, exists] = await Promise.all([
        AdminAccountModel.countDocuments(),
        AdminAccountModel.findOne({ emailKey }).lean(),
      ]);

      if (adminCount >= MAX_ADMIN_ACCOUNTS) {
        return res
          .status(409)
          .json({ message: `Only ${MAX_ADMIN_ACCOUNTS} admin accounts can be registered.` });
      }
      if (exists) {
        return res.status(409).json({ message: "Admin with this email already exists" });
      }

      const created = await AdminAccountModel.create(admin);
      return res.status(201).json({ success: true, admin: sanitizeAccount(created.toObject()) });
    }

    const store = await readStore();
    if (store.adminAccounts.length >= MAX_ADMIN_ACCOUNTS) {
      return res
        .status(409)
        .json({ message: `Only ${MAX_ADMIN_ACCOUNTS} admin accounts can be registered.` });
    }
    const exists = store.adminAccounts.some((account) => normalizeEmail(account.email) === emailKey);
    if (exists) {
      return res.status(409).json({ message: "Admin with this email already exists" });
    }

    store.adminAccounts.push(admin);
    await writeStore(store);
    res.status(201).json({ success: true, admin: sanitizeAccount(admin) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/admin/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const emailKey = normalizeEmail(email);
    const passwordKey = String(password || "");

    let admin;
    let adminCount;
    if (USE_MONGO) {
      [admin, adminCount] = await Promise.all([
        AdminAccountModel.findOne({ emailKey, password: passwordKey }).lean(),
        AdminAccountModel.countDocuments(),
      ]);
    } else {
      const store = await readStore();
      admin = store.adminAccounts.find(
        (account) => normalizeEmail(account.email) === emailKey && account.password === passwordKey
      );
      adminCount = store.adminAccounts.length;
    }

    if (admin) {
      return res.json({ user: { name: admin.name, email: admin.email, role: "admin" } });
    }

    if (adminCount < MAX_ADMIN_ACCOUNTS && emailKey === "admin@adzap.com" && passwordKey === "admin123") {
      return res.json({
        user: { name: "Default Admin", email: "admin@adzap.com", role: "admin" },
      });
    }

    res.status(401).json({ message: "Invalid credentials" });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/judge/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, and password are required" });
    }

    const emailKey = normalizeEmail(email);
    const judge = {
      id: nextId(),
      name: String(name).trim(),
      email: String(email).trim(),
      emailKey,
      password: String(password).trim(),
      createdAt: new Date().toISOString(),
    };

    if (USE_MONGO) {
      const [judgeCount, exists] = await Promise.all([
        JudgeAccountModel.countDocuments(),
        JudgeAccountModel.findOne({ emailKey }).lean(),
      ]);

      if (judgeCount >= MAX_JUDGE_ACCOUNTS) {
        return res
          .status(409)
          .json({ message: `Only ${MAX_JUDGE_ACCOUNTS} judge accounts can be registered.` });
      }
      if (exists) {
        return res.status(409).json({ message: "Judge with this email already exists" });
      }

      const created = await JudgeAccountModel.create(judge);
      return res.status(201).json({ success: true, judge: sanitizeAccount(created.toObject()) });
    }

    const store = await readStore();
    if (store.judgeAccounts.length >= MAX_JUDGE_ACCOUNTS) {
      return res
        .status(409)
        .json({ message: `Only ${MAX_JUDGE_ACCOUNTS} judge accounts can be registered.` });
    }
    const exists = store.judgeAccounts.some((account) => normalizeEmail(account.email) === emailKey);
    if (exists) {
      return res.status(409).json({ message: "Judge with this email already exists" });
    }

    store.judgeAccounts.push(judge);
    await writeStore(store);
    res.status(201).json({ success: true, judge: sanitizeAccount(judge) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/judge/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const emailKey = normalizeEmail(email);
    const passwordKey = String(password || "");

    let judge;
    let judgeCount;
    if (USE_MONGO) {
      [judge, judgeCount] = await Promise.all([
        JudgeAccountModel.findOne({ emailKey, password: passwordKey }).lean(),
        JudgeAccountModel.countDocuments(),
      ]);
    } else {
      const store = await readStore();
      judge = store.judgeAccounts.find(
        (account) => normalizeEmail(account.email) === emailKey && account.password === passwordKey
      );
      judgeCount = store.judgeAccounts.length;
    }

    if (judge) {
      return res.json({ user: { name: judge.name, email: judge.email, role: "judge" } });
    }

    const defaultJudgeEmails = ["judge1@adzap.com", "judge2@adzap.com"];
    if (judgeCount < MAX_JUDGE_ACCOUNTS && defaultJudgeEmails.includes(emailKey) && passwordKey === "judge123") {
      return res.json({ user: { name: emailKey, email: emailKey, role: "judge" } });
    }

    res.status(401).json({ message: "Invalid credentials" });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Internal server error" });
});

async function start() {
  if (USE_MONGO) {
    await initMongo();
    console.log("Storage mode: mongodb");
  } else {
    await ensureFileStore();
    console.log("Storage mode: file");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ADZAP backend is running on http://0.0.0.0:${PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to initialize backend:", error);
  process.exit(1);
});
