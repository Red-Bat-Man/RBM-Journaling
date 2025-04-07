var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users, insertUserSchema, emotions, insertEmotionSchema, people, insertPersonSchema, places, insertPlaceSchema, entries, insertEntrySchema, entryPeople, insertEntryPersonSchema, createEntrySchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      username: text("username").notNull().unique(),
      password: text("password").notNull()
    });
    insertUserSchema = createInsertSchema(users).pick({
      username: true,
      password: true
    });
    emotions = pgTable("emotions", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      emoji: text("emoji").notNull(),
      color: text("color").notNull()
    });
    insertEmotionSchema = createInsertSchema(emotions).pick({
      name: true,
      emoji: true,
      color: true
    });
    people = pgTable("people", {
      id: serial("id").primaryKey(),
      name: text("name").notNull()
    });
    insertPersonSchema = createInsertSchema(people).pick({
      name: true
    });
    places = pgTable("places", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      icon: text("icon").default("\u{1F4CD}")
    });
    insertPlaceSchema = createInsertSchema(places).pick({
      name: true,
      icon: true
    });
    entries = pgTable("entries", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      content: text("content").notNull(),
      emotionId: integer("emotion_id"),
      placeId: integer("place_id"),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      isFavorite: boolean("is_favorite").notNull().default(false)
    });
    insertEntrySchema = createInsertSchema(entries).pick({
      title: true,
      content: true,
      emotionId: true,
      placeId: true,
      isFavorite: true
    });
    entryPeople = pgTable("entry_people", {
      id: serial("id").primaryKey(),
      entryId: integer("entry_id").notNull(),
      personId: integer("person_id").notNull()
    });
    insertEntryPersonSchema = createInsertSchema(entryPeople).pick({
      entryId: true,
      personId: true
    });
    createEntrySchema = z.object({
      entry: insertEntrySchema,
      peopleIds: z.array(z.number()).optional()
    });
  }
});

// server/db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
var connectionString, client, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    client = postgres(connectionString, {
      max: 10,
      // Set max pool connections
      idle_timeout: 20,
      // Timeout idle connections after 20 seconds
      connect_timeout: 10
      // Connection timeout after 10 seconds
    });
    db = drizzle(client);
    console.log(`[INFO] ${(/* @__PURE__ */ new Date()).toISOString()}: Database connection established`);
  }
});

// server/logger.ts
var logger;
var init_logger = __esm({
  "server/logger.ts"() {
    "use strict";
    logger = {
      info: (message) => {
        console.log(`[INFO] ${(/* @__PURE__ */ new Date()).toISOString()}: ${message}`);
      },
      error: (message, error) => {
        console.error(`[ERROR] ${(/* @__PURE__ */ new Date()).toISOString()}: ${message}`);
        if (error) {
          console.error(error);
        }
      },
      warn: (message) => {
        console.warn(`[WARN] ${(/* @__PURE__ */ new Date()).toISOString()}: ${message}`);
      },
      debug: (message) => {
        if (process.env.NODE_ENV !== "production") {
          console.debug(`[DEBUG] ${(/* @__PURE__ */ new Date()).toISOString()}: ${message}`);
        }
      }
    };
  }
});

// server/storage.ts
var storage_exports = {};
__export(storage_exports, {
  DatabaseStorage: () => DatabaseStorage,
  storage: () => storage
});
import session from "express-session";
import connectPg from "connect-pg-simple";
import { eq, inArray } from "drizzle-orm";
var DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    init_logger();
    DatabaseStorage = class {
      sessionStore;
      constructor() {
        const PostgresSessionStore = connectPg(session);
        this.sessionStore = new PostgresSessionStore({
          conObject: {
            connectionString: process.env.DATABASE_URL
          },
          createTableIfMissing: true
        });
      }
      // New method to initialize data called from outside
      async initialize() {
        await this.initDefaultData();
      }
      async initDefaultData() {
        try {
          const emotions2 = await this.getEmotions();
          const places2 = await this.getPlaces();
          if (emotions2.length === 0) {
            await this.initDefaultEmotions();
          }
          if (places2.length === 0) {
            await this.initDefaultPlaces();
          }
          logger.info("Default data initialized successfully");
        } catch (error) {
          logger.error("Failed to initialize default data", error);
        }
      }
      async initDefaultPlaces() {
        const defaultPlaces = [
          { name: "Home", icon: "\u{1F3E0}" },
          { name: "Work", icon: "\u{1F3E2}" },
          { name: "Coffee Shop", icon: "\u2615" },
          { name: "Restaurant", icon: "\u{1F37D}\uFE0F" },
          { name: "Park", icon: "\u{1F333}" },
          { name: "Gym", icon: "\u{1F4AA}" },
          { name: "Beach", icon: "\u{1F3D6}\uFE0F" },
          { name: "School", icon: "\u{1F393}" }
        ];
        await db.insert(places).values(defaultPlaces);
      }
      async initDefaultEmotions() {
        const defaultEmotions = [
          { name: "Happy", emoji: "\u{1F60A}", color: "#818CF8" },
          { name: "Sad", emoji: "\u{1F614}", color: "#60A5FA" },
          { name: "Angry", emoji: "\u{1F621}", color: "#EF4444" },
          { name: "Calm", emoji: "\u{1F60C}", color: "#34D399" },
          { name: "Anxious", emoji: "\u{1F630}", color: "#F59E0B" },
          { name: "Loved", emoji: "\u{1F970}", color: "#EC4899" },
          { name: "Excited", emoji: "\u{1F929}", color: "#8B5CF6" },
          { name: "Frustrated", emoji: "\u{1F624}", color: "#F97316" }
        ];
        await db.insert(emotions).values(defaultEmotions);
      }
      // User operations
      async getUser(id) {
        try {
          const [user] = await db.select().from(users).where(eq(users.id, id));
          return user;
        } catch (error) {
          logger.error(`Failed to get user with id ${id}`, error);
          throw error;
        }
      }
      async getUserByUsername(username) {
        try {
          const [user] = await db.select().from(users).where(eq(users.username, username));
          return user;
        } catch (error) {
          logger.error(`Failed to get user with username ${username}`, error);
          throw error;
        }
      }
      async createUser(insertUser) {
        try {
          const [user] = await db.insert(users).values(insertUser).returning();
          return user;
        } catch (error) {
          logger.error("Failed to create user", error);
          throw error;
        }
      }
      // Emotion operations
      async getEmotions() {
        try {
          return await db.select().from(emotions);
        } catch (error) {
          logger.error("Failed to get emotions", error);
          throw error;
        }
      }
      async getEmotion(id) {
        try {
          const [emotion] = await db.select().from(emotions).where(eq(emotions.id, id));
          return emotion;
        } catch (error) {
          logger.error(`Failed to get emotion with id ${id}`, error);
          throw error;
        }
      }
      async createEmotion(insertEmotion) {
        try {
          const [emotion] = await db.insert(emotions).values(insertEmotion).returning();
          return emotion;
        } catch (error) {
          logger.error("Failed to create emotion", error);
          throw error;
        }
      }
      async updateEmotion(id, updateData) {
        try {
          const [updatedEmotion] = await db.update(emotions).set(updateData).where(eq(emotions.id, id)).returning();
          return updatedEmotion;
        } catch (error) {
          logger.error(`Failed to update emotion with id ${id}`, error);
          throw error;
        }
      }
      async deleteEmotion(id) {
        try {
          await db.update(entries).set({ emotionId: null }).where(eq(entries.emotionId, id));
          const result = await db.delete(emotions).where(eq(emotions.id, id));
          return result.count > 0;
        } catch (error) {
          logger.error(`Failed to delete emotion with id ${id}`, error);
          throw error;
        }
      }
      // Person operations
      async getPeople() {
        try {
          return await db.select().from(people);
        } catch (error) {
          logger.error("Failed to get people", error);
          throw error;
        }
      }
      async getPerson(id) {
        try {
          const [person] = await db.select().from(people).where(eq(people.id, id));
          return person;
        } catch (error) {
          logger.error(`Failed to get person with id ${id}`, error);
          throw error;
        }
      }
      async createPerson(insertPerson) {
        try {
          const [person] = await db.insert(people).values(insertPerson).returning();
          return person;
        } catch (error) {
          logger.error("Failed to create person", error);
          throw error;
        }
      }
      async updatePerson(id, updateData) {
        try {
          const [updatedPerson] = await db.update(people).set(updateData).where(eq(people.id, id)).returning();
          return updatedPerson;
        } catch (error) {
          logger.error(`Failed to update person with id ${id}`, error);
          throw error;
        }
      }
      async deletePerson(id) {
        try {
          await db.delete(entryPeople).where(eq(entryPeople.personId, id));
          const result = await db.delete(people).where(eq(people.id, id));
          return result.count > 0;
        } catch (error) {
          logger.error(`Failed to delete person with id ${id}`, error);
          throw error;
        }
      }
      // Place operations
      async getPlaces() {
        try {
          return await db.select().from(places);
        } catch (error) {
          logger.error("Failed to get places", error);
          throw error;
        }
      }
      async getPlace(id) {
        try {
          const [place] = await db.select().from(places).where(eq(places.id, id));
          return place;
        } catch (error) {
          logger.error(`Failed to get place with id ${id}`, error);
          throw error;
        }
      }
      async createPlace(insertPlace) {
        try {
          const placeData = {
            ...insertPlace,
            icon: insertPlace.icon || "\u{1F4CD}"
          };
          const [place] = await db.insert(places).values(placeData).returning();
          return place;
        } catch (error) {
          logger.error("Failed to create place", error);
          throw error;
        }
      }
      async updatePlace(id, updateData) {
        try {
          const [updatedPlace] = await db.update(places).set(updateData).where(eq(places.id, id)).returning();
          return updatedPlace;
        } catch (error) {
          logger.error(`Failed to update place with id ${id}`, error);
          throw error;
        }
      }
      async deletePlace(id) {
        try {
          await db.update(entries).set({ placeId: null }).where(eq(entries.placeId, id));
          const result = await db.delete(places).where(eq(places.id, id));
          return result.count > 0;
        } catch (error) {
          logger.error(`Failed to delete place with id ${id}`, error);
          throw error;
        }
      }
      // Entry operations
      async getEntries() {
        try {
          const allEntries = await db.select().from(entries);
          return Promise.all(allEntries.map((entry) => this.populateEntryRelations(entry)));
        } catch (error) {
          logger.error("Failed to get entries", error);
          throw error;
        }
      }
      async getEntry(id) {
        try {
          const [entry] = await db.select().from(entries).where(eq(entries.id, id));
          if (!entry) return void 0;
          return this.populateEntryRelations(entry);
        } catch (error) {
          logger.error(`Failed to get entry with id ${id}`, error);
          throw error;
        }
      }
      async createEntry(insertEntry, peopleIds = []) {
        try {
          const entryData = {
            ...insertEntry,
            emotionId: insertEntry.emotionId ?? null,
            placeId: insertEntry.placeId ?? null,
            isFavorite: insertEntry.isFavorite ?? false,
            createdAt: /* @__PURE__ */ new Date()
          };
          const [entry] = await db.insert(entries).values(entryData).returning();
          if (peopleIds.length > 0) {
            await this.updateEntryPeopleAssociations(entry.id, peopleIds);
          }
          return this.populateEntryRelations(entry);
        } catch (error) {
          logger.error("Failed to create entry", error);
          throw error;
        }
      }
      async updateEntry(id, updateData, peopleIds) {
        try {
          const [updatedEntry] = await db.update(entries).set(updateData).where(eq(entries.id, id)).returning();
          if (!updatedEntry) return void 0;
          if (peopleIds !== void 0) {
            await this.updateEntryPeopleAssociations(id, peopleIds);
          }
          return this.populateEntryRelations(updatedEntry);
        } catch (error) {
          logger.error(`Failed to update entry with id ${id}`, error);
          throw error;
        }
      }
      async deleteEntry(id) {
        try {
          await db.delete(entryPeople).where(eq(entryPeople.entryId, id));
          const result = await db.delete(entries).where(eq(entries.id, id));
          return result.count > 0;
        } catch (error) {
          logger.error(`Failed to delete entry with id ${id}`, error);
          throw error;
        }
      }
      async getEntriesByEmotion(emotionId) {
        try {
          const entriesWithEmotion = await db.select().from(entries).where(eq(entries.emotionId, emotionId));
          return Promise.all(entriesWithEmotion.map((entry) => this.populateEntryRelations(entry)));
        } catch (error) {
          logger.error(`Failed to get entries by emotion id ${emotionId}`, error);
          throw error;
        }
      }
      async getEntriesByPerson(personId) {
        try {
          const entryPeopleAssociations = await db.select().from(entryPeople).where(eq(entryPeople.personId, personId));
          const entryIds = entryPeopleAssociations.map((ep) => ep.entryId);
          if (entryIds.length === 0) {
            return [];
          }
          const entriesWithPerson = await db.select().from(entries).where(inArray(entries.id, entryIds));
          return Promise.all(entriesWithPerson.map((entry) => this.populateEntryRelations(entry)));
        } catch (error) {
          logger.error(`Failed to get entries by person id ${personId}`, error);
          throw error;
        }
      }
      async getEntriesByPlace(placeId) {
        try {
          const entriesWithPlace = await db.select().from(entries).where(eq(entries.placeId, placeId));
          return Promise.all(entriesWithPlace.map((entry) => this.populateEntryRelations(entry)));
        } catch (error) {
          logger.error(`Failed to get entries by place id ${placeId}`, error);
          throw error;
        }
      }
      async getFavoriteEntries() {
        try {
          const favoriteEntries = await db.select().from(entries).where(eq(entries.isFavorite, true));
          return Promise.all(favoriteEntries.map((entry) => this.populateEntryRelations(entry)));
        } catch (error) {
          logger.error("Failed to get favorite entries", error);
          throw error;
        }
      }
      async toggleFavorite(id) {
        try {
          const [entry] = await db.select().from(entries).where(eq(entries.id, id));
          if (!entry) return void 0;
          const [updatedEntry] = await db.update(entries).set({ isFavorite: !entry.isFavorite }).where(eq(entries.id, id)).returning();
          return this.populateEntryRelations(updatedEntry);
        } catch (error) {
          logger.error(`Failed to toggle favorite status for entry with id ${id}`, error);
          throw error;
        }
      }
      // Helper methods
      async updateEntryPeopleAssociations(entryId, peopleIds) {
        try {
          await db.delete(entryPeople).where(eq(entryPeople.entryId, entryId));
          if (peopleIds.length > 0) {
            const associations = peopleIds.map((personId) => ({
              entryId,
              personId
            }));
            await db.insert(entryPeople).values(associations);
          }
        } catch (error) {
          logger.error(`Failed to update entry-people associations for entry id ${entryId}`, error);
          throw error;
        }
      }
      async populateEntryRelations(entry) {
        try {
          let emotion;
          if (entry.emotionId) {
            const [foundEmotion] = await db.select().from(emotions).where(eq(emotions.id, entry.emotionId));
            emotion = foundEmotion;
          }
          let place;
          if (entry.placeId) {
            const [foundPlace] = await db.select().from(places).where(eq(places.id, entry.placeId));
            place = foundPlace;
          }
          const entryPeopleAssociations = await db.select().from(entryPeople).where(eq(entryPeople.entryId, entry.id));
          const peopleIds = entryPeopleAssociations.map((ep) => ep.personId);
          let associatedPeople = [];
          if (peopleIds.length > 0) {
            associatedPeople = await db.select().from(people).where(inArray(people.id, peopleIds));
          }
          return {
            ...entry,
            emotion,
            place,
            people: associatedPeople
          };
        } catch (error) {
          logger.error(`Failed to populate relations for entry id ${entry.id}`, error);
          throw new Error(`Failed to populate relations: ${error?.message || "Unknown error"}`);
        }
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
init_storage();
init_schema();
import { z as z2 } from "zod";

// server/auth.ts
init_storage();
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const sessionSecret = process.env.SESSION_SECRET || "reflecty-journal-secret-key";
  const sessionSettings = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1e3,
      // 1 week
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !await comparePasswords(password, user.password)) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password)
      });
      req.login(user, (err) => {
        if (err) return next(err);
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      req.login(user, (err2) => {
        if (err2) return next(err2);
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
}

// server/routes.ts
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.get("/api/emotions", async (req, res) => {
    try {
      const emotions2 = await storage.getEmotions();
      res.json(emotions2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch emotions" });
    }
  });
  app2.get("/api/emotions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const emotion = await storage.getEmotion(id);
      if (!emotion) {
        return res.status(404).json({ message: "Emotion not found" });
      }
      res.json(emotion);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch emotion" });
    }
  });
  app2.post("/api/emotions", async (req, res) => {
    try {
      const emotionData = insertEmotionSchema.parse(req.body);
      const emotion = await storage.createEmotion(emotionData);
      res.status(201).json(emotion);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid emotion data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create emotion" });
    }
  });
  app2.put("/api/emotions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const emotionData = insertEmotionSchema.partial().parse(req.body);
      const emotion = await storage.updateEmotion(id, emotionData);
      if (!emotion) {
        return res.status(404).json({ message: "Emotion not found" });
      }
      res.json(emotion);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid emotion data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update emotion" });
    }
  });
  app2.delete("/api/emotions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEmotion(id);
      if (!success) {
        return res.status(404).json({ message: "Emotion not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete emotion" });
    }
  });
  app2.get("/api/people", async (req, res) => {
    try {
      const people2 = await storage.getPeople();
      res.json(people2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch people" });
    }
  });
  app2.get("/api/people/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const person = await storage.getPerson(id);
      if (!person) {
        return res.status(404).json({ message: "Person not found" });
      }
      res.json(person);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch person" });
    }
  });
  app2.post("/api/people", async (req, res) => {
    try {
      const personData = insertPersonSchema.parse(req.body);
      const person = await storage.createPerson(personData);
      res.status(201).json(person);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid person data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create person" });
    }
  });
  app2.put("/api/people/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const personData = insertPersonSchema.partial().parse(req.body);
      const person = await storage.updatePerson(id, personData);
      if (!person) {
        return res.status(404).json({ message: "Person not found" });
      }
      res.json(person);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid person data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update person" });
    }
  });
  app2.delete("/api/people/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePerson(id);
      if (!success) {
        return res.status(404).json({ message: "Person not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete person" });
    }
  });
  app2.get("/api/places", async (req, res) => {
    try {
      const places2 = await storage.getPlaces();
      res.json(places2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch places" });
    }
  });
  app2.get("/api/places/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const place = await storage.getPlace(id);
      if (!place) {
        return res.status(404).json({ message: "Place not found" });
      }
      res.json(place);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch place" });
    }
  });
  app2.post("/api/places", async (req, res) => {
    try {
      const placeData = insertPlaceSchema.parse(req.body);
      const place = await storage.createPlace(placeData);
      res.status(201).json(place);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid place data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create place" });
    }
  });
  app2.put("/api/places/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const placeData = insertPlaceSchema.partial().parse(req.body);
      const place = await storage.updatePlace(id, placeData);
      if (!place) {
        return res.status(404).json({ message: "Place not found" });
      }
      res.json(place);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid place data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update place" });
    }
  });
  app2.delete("/api/places/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePlace(id);
      if (!success) {
        return res.status(404).json({ message: "Place not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete place" });
    }
  });
  app2.get("/api/entries/by-place/:placeId", async (req, res) => {
    try {
      const placeId = parseInt(req.params.placeId);
      const entries2 = await storage.getEntriesByPlace(placeId);
      res.json(entries2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch entries by place" });
    }
  });
  app2.get("/api/entries", async (req, res) => {
    try {
      const entries2 = await storage.getEntries();
      res.json(entries2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch entries" });
    }
  });
  app2.get("/api/entries/by-emotion/:emotionId", async (req, res) => {
    try {
      const emotionId = parseInt(req.params.emotionId);
      const entries2 = await storage.getEntriesByEmotion(emotionId);
      res.json(entries2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch entries by emotion" });
    }
  });
  app2.get("/api/entries/by-person/:personId", async (req, res) => {
    try {
      const personId = parseInt(req.params.personId);
      const entries2 = await storage.getEntriesByPerson(personId);
      res.json(entries2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch entries by person" });
    }
  });
  app2.get("/api/entries/favorites", async (req, res) => {
    try {
      const entries2 = await storage.getFavoriteEntries();
      res.json(entries2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorite entries" });
    }
  });
  app2.get("/api/entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const entry = await storage.getEntry(id);
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch entry" });
    }
  });
  app2.post("/api/entries", async (req, res) => {
    try {
      const { entry: entryData, peopleIds } = createEntrySchema.parse(req.body);
      const entry = await storage.createEntry(entryData, peopleIds);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid entry data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create entry" });
    }
  });
  app2.put("/api/entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const parsedData = createEntrySchema.partial().parse(req.body);
      const entryData = parsedData.entry || {};
      const peopleIds = parsedData.peopleIds;
      const entry = await storage.updateEntry(id, entryData, peopleIds);
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      res.json(entry);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid entry data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update entry" });
    }
  });
  app2.delete("/api/entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEntry(id);
      if (!success) {
        return res.status(404).json({ message: "Entry not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete entry" });
    }
  });
  app2.patch("/api/entries/:id/toggle-favorite", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const entry = await storage.toggleFavorite(id);
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle favorite status" });
    }
  });
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server2) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server: server2 },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import { createServer } from "http";
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
var port = 5e3;
var server = createServer(app);
log("About to start server on port " + port);
server.listen({
  port,
  host: "0.0.0.0",
  reusePort: true
}, () => {
  log(`serving on port ${port}`);
});
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});
(async () => {
  try {
    await registerRoutes(app);
    app.use((err, _req, res, _next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      throw err;
    });
    const { storage: storage2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    storage2.initialize().catch((error) => {
      console.error("Failed to initialize storage:", error);
    });
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
    log("Application setup complete!");
  } catch (error) {
    console.error("Error during application setup:", error);
  }
})();
