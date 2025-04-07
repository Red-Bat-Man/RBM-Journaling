import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertEmotionSchema, 
  insertPersonSchema, 
  insertPlaceSchema,
  insertEntrySchema,
  createEntrySchema
} from "@shared/schema";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  // GET all emotions
  app.get("/api/emotions", async (req, res) => {
    try {
      const emotions = await storage.getEmotions();
      res.json(emotions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch emotions" });
    }
  });

  // GET a specific emotion
  app.get("/api/emotions/:id", async (req, res) => {
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

  // CREATE a new emotion
  app.post("/api/emotions", async (req, res) => {
    try {
      const emotionData = insertEmotionSchema.parse(req.body);
      const emotion = await storage.createEmotion(emotionData);
      res.status(201).json(emotion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid emotion data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create emotion" });
    }
  });

  // UPDATE an emotion
  app.put("/api/emotions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const emotionData = insertEmotionSchema.partial().parse(req.body);
      const emotion = await storage.updateEmotion(id, emotionData);
      
      if (!emotion) {
        return res.status(404).json({ message: "Emotion not found" });
      }
      
      res.json(emotion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid emotion data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update emotion" });
    }
  });

  // DELETE an emotion
  app.delete("/api/emotions/:id", async (req, res) => {
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

  // GET all people
  app.get("/api/people", async (req, res) => {
    try {
      const people = await storage.getPeople();
      res.json(people);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch people" });
    }
  });

  // GET a specific person
  app.get("/api/people/:id", async (req, res) => {
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

  // CREATE a new person
  app.post("/api/people", async (req, res) => {
    try {
      const personData = insertPersonSchema.parse(req.body);
      const person = await storage.createPerson(personData);
      res.status(201).json(person);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid person data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create person" });
    }
  });

  // UPDATE a person
  app.put("/api/people/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const personData = insertPersonSchema.partial().parse(req.body);
      const person = await storage.updatePerson(id, personData);
      
      if (!person) {
        return res.status(404).json({ message: "Person not found" });
      }
      
      res.json(person);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid person data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update person" });
    }
  });

  // DELETE a person
  app.delete("/api/people/:id", async (req, res) => {
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
  
  // GET all places
  app.get("/api/places", async (req, res) => {
    try {
      const places = await storage.getPlaces();
      res.json(places);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch places" });
    }
  });

  // GET a specific place
  app.get("/api/places/:id", async (req, res) => {
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

  // CREATE a new place
  app.post("/api/places", async (req, res) => {
    try {
      const placeData = insertPlaceSchema.parse(req.body);
      const place = await storage.createPlace(placeData);
      res.status(201).json(place);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid place data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create place" });
    }
  });

  // UPDATE a place
  app.put("/api/places/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const placeData = insertPlaceSchema.partial().parse(req.body);
      const place = await storage.updatePlace(id, placeData);
      
      if (!place) {
        return res.status(404).json({ message: "Place not found" });
      }
      
      res.json(place);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid place data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update place" });
    }
  });

  // DELETE a place
  app.delete("/api/places/:id", async (req, res) => {
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

  // GET entries by place
  app.get("/api/entries/by-place/:placeId", async (req, res) => {
    try {
      const placeId = parseInt(req.params.placeId);
      const entries = await storage.getEntriesByPlace(placeId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch entries by place" });
    }
  });

  // GET all entries
  app.get("/api/entries", async (req, res) => {
    try {
      const entries = await storage.getEntries();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch entries" });
    }
  });

  // GET entries by emotion
  app.get("/api/entries/by-emotion/:emotionId", async (req, res) => {
    try {
      const emotionId = parseInt(req.params.emotionId);
      const entries = await storage.getEntriesByEmotion(emotionId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch entries by emotion" });
    }
  });

  // GET entries by person
  app.get("/api/entries/by-person/:personId", async (req, res) => {
    try {
      const personId = parseInt(req.params.personId);
      const entries = await storage.getEntriesByPerson(personId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch entries by person" });
    }
  });

  // GET favorite entries
  app.get("/api/entries/favorites", async (req, res) => {
    try {
      const entries = await storage.getFavoriteEntries();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorite entries" });
    }
  });

  // GET a specific entry
  app.get("/api/entries/:id", async (req, res) => {
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

  // CREATE a new entry
  app.post("/api/entries", async (req, res) => {
    try {
      const { entry: entryData, peopleIds } = createEntrySchema.parse(req.body);
      const entry = await storage.createEntry(entryData, peopleIds);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid entry data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create entry" });
    }
  });

  // UPDATE an entry
  app.put("/api/entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const parsedData = createEntrySchema.partial().parse(req.body);
      // Ensure entryData is never undefined
      const entryData = parsedData.entry || {};
      const peopleIds = parsedData.peopleIds;
      
      const entry = await storage.updateEntry(id, entryData, peopleIds);
      
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      
      res.json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid entry data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update entry" });
    }
  });

  // DELETE an entry
  app.delete("/api/entries/:id", async (req, res) => {
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

  // TOGGLE favorite status of an entry
  app.patch("/api/entries/:id/toggle-favorite", async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
