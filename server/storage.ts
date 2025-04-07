import { 
  users, type User, type InsertUser,
  emotions, type Emotion, type InsertEmotion,
  people, type Person, type InsertPerson,
  places, type Place, type InsertPlace,
  entries, type Entry, type InsertEntry,
  entryPeople, type EntryPerson, type InsertEntryPerson,
  type EntryWithRelations
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { logger } from "./logger";
import { eq, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Emotion operations
  getEmotions(): Promise<Emotion[]>;
  getEmotion(id: number): Promise<Emotion | undefined>;
  createEmotion(emotion: InsertEmotion): Promise<Emotion>;
  updateEmotion(id: number, emotion: Partial<InsertEmotion>): Promise<Emotion | undefined>;
  deleteEmotion(id: number): Promise<boolean>;

  // Person operations
  getPeople(): Promise<Person[]>;
  getPerson(id: number): Promise<Person | undefined>;
  createPerson(person: InsertPerson): Promise<Person>;
  updatePerson(id: number, person: Partial<InsertPerson>): Promise<Person | undefined>;
  deletePerson(id: number): Promise<boolean>;

  // Place operations
  getPlaces(): Promise<Place[]>;
  getPlace(id: number): Promise<Place | undefined>;
  createPlace(place: InsertPlace): Promise<Place>;
  updatePlace(id: number, place: Partial<InsertPlace>): Promise<Place | undefined>;
  deletePlace(id: number): Promise<boolean>;

  // Entry operations
  getEntries(): Promise<EntryWithRelations[]>;
  getEntry(id: number): Promise<EntryWithRelations | undefined>;
  createEntry(entry: InsertEntry, peopleIds?: number[]): Promise<EntryWithRelations>;
  updateEntry(id: number, entry: Partial<InsertEntry>, peopleIds?: number[]): Promise<EntryWithRelations | undefined>;
  deleteEntry(id: number): Promise<boolean>;
  getEntriesByEmotion(emotionId: number): Promise<EntryWithRelations[]>;
  getEntriesByPerson(personId: number): Promise<EntryWithRelations[]>;
  getEntriesByPlace(placeId: number): Promise<EntryWithRelations[]>;
  getFavoriteEntries(): Promise<EntryWithRelations[]>;
  toggleFavorite(id: number): Promise<EntryWithRelations | undefined>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    // Create PostgreSQL session store
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      createTableIfMissing: true,
    });

    // Initialize default data
    this.initDefaultData();
  }

  private async initDefaultData() {
    try {
      // Check if we already have emotions and places
      const emotions = await this.getEmotions();
      const places = await this.getPlaces();

      // Only initialize if we don't have default data yet
      if (emotions.length === 0) {
        await this.initDefaultEmotions();
      }

      if (places.length === 0) {
        await this.initDefaultPlaces();
      }

      logger.info("Default data initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize default data", error);
    }
  }

  private async initDefaultPlaces() {
    const defaultPlaces = [
      { name: "Home", icon: "🏠" },
      { name: "Work", icon: "🏢" },
      { name: "Coffee Shop", icon: "☕" },
      { name: "Restaurant", icon: "🍽️" },
      { name: "Park", icon: "🌳" },
      { name: "Gym", icon: "💪" },
      { name: "Beach", icon: "🏖️" },
      { name: "School", icon: "🎓" },
    ];

    for (const place of defaultPlaces) {
      await this.createPlace(place);
    }
  }

  private async initDefaultEmotions() {
    const defaultEmotions = [
      { name: "Happy", emoji: "😊", color: "#818CF8" },
      { name: "Sad", emoji: "😔", color: "#60A5FA" },
      { name: "Angry", emoji: "😡", color: "#EF4444" },
      { name: "Calm", emoji: "😌", color: "#34D399" },
      { name: "Anxious", emoji: "😰", color: "#F59E0B" },
      { name: "Loved", emoji: "🥰", color: "#EC4899" },
      { name: "Excited", emoji: "🤩", color: "#8B5CF6" },
      { name: "Frustrated", emoji: "😤", color: "#F97316" },
    ];

    for (const emotion of defaultEmotions) {
      await this.createEmotion(emotion);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      logger.error(`Failed to get user with id ${id}`, error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      logger.error(`Failed to get user with username ${username}`, error);
      throw error;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db.insert(users).values(insertUser).returning();
      return user;
    } catch (error) {
      logger.error('Failed to create user', error);
      throw error;
    }
  }

  // Emotion operations
  async getEmotions(): Promise<Emotion[]> {
    try {
      return await db.select().from(emotions);
    } catch (error) {
      logger.error('Failed to get emotions', error);
      throw error;
    }
  }

  async getEmotion(id: number): Promise<Emotion | undefined> {
    try {
      const [emotion] = await db.select().from(emotions).where(eq(emotions.id, id));
      return emotion;
    } catch (error) {
      logger.error(`Failed to get emotion with id ${id}`, error);
      throw error;
    }
  }

  async createEmotion(insertEmotion: InsertEmotion): Promise<Emotion> {
    try {
      const [emotion] = await db.insert(emotions).values(insertEmotion).returning();
      return emotion;
    } catch (error) {
      logger.error('Failed to create emotion', error);
      throw error;
    }
  }

  async updateEmotion(id: number, updateData: Partial<InsertEmotion>): Promise<Emotion | undefined> {
    try {
      const [updatedEmotion] = await db
        .update(emotions)
        .set(updateData)
        .where(eq(emotions.id, id))
        .returning();
      return updatedEmotion;
    } catch (error) {
      logger.error(`Failed to update emotion with id ${id}`, error);
      throw error;
    }
  }

  async deleteEmotion(id: number): Promise<boolean> {
    try {
      // First update any entries that reference this emotion
      await db
        .update(entries)
        .set({ emotionId: null })
        .where(eq(entries.emotionId, id));
        
      // Then delete the emotion
      const result = await db.delete(emotions).where(eq(emotions.id, id));
      return result.count > 0;
    } catch (error) {
      logger.error(`Failed to delete emotion with id ${id}`, error);
      throw error;
    }
  }

  // Person operations
  async getPeople(): Promise<Person[]> {
    try {
      return await db.select().from(people);
    } catch (error) {
      logger.error('Failed to get people', error);
      throw error;
    }
  }

  async getPerson(id: number): Promise<Person | undefined> {
    try {
      const [person] = await db.select().from(people).where(eq(people.id, id));
      return person;
    } catch (error) {
      logger.error(`Failed to get person with id ${id}`, error);
      throw error;
    }
  }

  async createPerson(insertPerson: InsertPerson): Promise<Person> {
    try {
      const [person] = await db.insert(people).values(insertPerson).returning();
      return person;
    } catch (error) {
      logger.error('Failed to create person', error);
      throw error;
    }
  }

  async updatePerson(id: number, updateData: Partial<InsertPerson>): Promise<Person | undefined> {
    try {
      const [updatedPerson] = await db
        .update(people)
        .set(updateData)
        .where(eq(people.id, id))
        .returning();
      return updatedPerson;
    } catch (error) {
      logger.error(`Failed to update person with id ${id}`, error);
      throw error;
    }
  }

  async deletePerson(id: number): Promise<boolean> {
    try {
      // First delete all entries_people associations
      await db.delete(entryPeople).where(eq(entryPeople.personId, id));
      
      // Then delete the person
      const result = await db.delete(people).where(eq(people.id, id));
      return result.count > 0;
    } catch (error) {
      logger.error(`Failed to delete person with id ${id}`, error);
      throw error;
    }
  }

  // Place operations
  async getPlaces(): Promise<Place[]> {
    try {
      return await db.select().from(places);
    } catch (error) {
      logger.error('Failed to get places', error);
      throw error;
    }
  }

  async getPlace(id: number): Promise<Place | undefined> {
    try {
      const [place] = await db.select().from(places).where(eq(places.id, id));
      return place;
    } catch (error) {
      logger.error(`Failed to get place with id ${id}`, error);
      throw error;
    }
  }

  async createPlace(insertPlace: InsertPlace): Promise<Place> {
    try {
      // Ensure icon is never undefined
      const placeData = {
        ...insertPlace,
        icon: insertPlace.icon || "📍"
      };
      
      const [place] = await db.insert(places).values(placeData).returning();
      return place;
    } catch (error) {
      logger.error('Failed to create place', error);
      throw error;
    }
  }

  async updatePlace(id: number, updateData: Partial<InsertPlace>): Promise<Place | undefined> {
    try {
      const [updatedPlace] = await db
        .update(places)
        .set(updateData)
        .where(eq(places.id, id))
        .returning();
      return updatedPlace;
    } catch (error) {
      logger.error(`Failed to update place with id ${id}`, error);
      throw error;
    }
  }

  async deletePlace(id: number): Promise<boolean> {
    try {
      // First update any entries that reference this place
      await db
        .update(entries)
        .set({ placeId: null })
        .where(eq(entries.placeId, id));
        
      // Then delete the place
      const result = await db.delete(places).where(eq(places.id, id));
      return result.count > 0;
    } catch (error) {
      logger.error(`Failed to delete place with id ${id}`, error);
      throw error;
    }
  }

  // Entry operations
  async getEntries(): Promise<EntryWithRelations[]> {
    try {
      const allEntries = await db.select().from(entries);
      return Promise.all(allEntries.map(entry => this.populateEntryRelations(entry)));
    } catch (error) {
      logger.error('Failed to get entries', error);
      throw error;
    }
  }

  async getEntry(id: number): Promise<EntryWithRelations | undefined> {
    try {
      const [entry] = await db.select().from(entries).where(eq(entries.id, id));
      if (!entry) return undefined;
      return this.populateEntryRelations(entry);
    } catch (error) {
      logger.error(`Failed to get entry with id ${id}`, error);
      throw error;
    }
  }

  async createEntry(insertEntry: InsertEntry, peopleIds: number[] = []): Promise<EntryWithRelations> {
    try {
      // Ensure required fields are properly set
      const entryData = {
        ...insertEntry,
        emotionId: insertEntry.emotionId ?? null,
        placeId: insertEntry.placeId ?? null,
        isFavorite: insertEntry.isFavorite ?? false,
        createdAt: new Date()
      };
      
      const [entry] = await db.insert(entries).values(entryData).returning();
      
      // Associate people with this entry
      if (peopleIds.length > 0) {
        await this.updateEntryPeopleAssociations(entry.id, peopleIds);
      }
      
      return this.populateEntryRelations(entry);
    } catch (error) {
      logger.error('Failed to create entry', error);
      throw error;
    }
  }

  async updateEntry(id: number, updateData: Partial<InsertEntry>, peopleIds?: number[]): Promise<EntryWithRelations | undefined> {
    try {
      const [updatedEntry] = await db
        .update(entries)
        .set(updateData)
        .where(eq(entries.id, id))
        .returning();
        
      if (!updatedEntry) return undefined;
      
      // Update people associations if provided
      if (peopleIds !== undefined) {
        await this.updateEntryPeopleAssociations(id, peopleIds);
      }
      
      return this.populateEntryRelations(updatedEntry);
    } catch (error) {
      logger.error(`Failed to update entry with id ${id}`, error);
      throw error;
    }
  }

  async deleteEntry(id: number): Promise<boolean> {
    try {
      // First delete all entries_people associations
      await db.delete(entryPeople).where(eq(entryPeople.entryId, id));
      
      // Then delete the entry
      const result = await db.delete(entries).where(eq(entries.id, id));
      return result.count > 0;
    } catch (error) {
      logger.error(`Failed to delete entry with id ${id}`, error);
      throw error;
    }
  }

  async getEntriesByEmotion(emotionId: number): Promise<EntryWithRelations[]> {
    try {
      const entriesWithEmotion = await db
        .select()
        .from(entries)
        .where(eq(entries.emotionId, emotionId));
        
      return Promise.all(entriesWithEmotion.map(entry => this.populateEntryRelations(entry)));
    } catch (error) {
      logger.error(`Failed to get entries by emotion id ${emotionId}`, error);
      throw error;
    }
  }

  async getEntriesByPerson(personId: number): Promise<EntryWithRelations[]> {
    try {
      // Find all entry IDs associated with this person
      const entryPeopleAssociations = await db
        .select()
        .from(entryPeople)
        .where(eq(entryPeople.personId, personId));
      
      const entryIds = entryPeopleAssociations.map(ep => ep.entryId);
      
      if (entryIds.length === 0) {
        return [];
      }
      
      // Get those entries
      const entriesWithPerson = await db
        .select()
        .from(entries)
        .where(inArray(entries.id, entryIds));
        
      return Promise.all(entriesWithPerson.map(entry => this.populateEntryRelations(entry)));
    } catch (error) {
      logger.error(`Failed to get entries by person id ${personId}`, error);
      throw error;
    }
  }

  async getEntriesByPlace(placeId: number): Promise<EntryWithRelations[]> {
    try {
      const entriesWithPlace = await db
        .select()
        .from(entries)
        .where(eq(entries.placeId, placeId));
        
      return Promise.all(entriesWithPlace.map(entry => this.populateEntryRelations(entry)));
    } catch (error) {
      logger.error(`Failed to get entries by place id ${placeId}`, error);
      throw error;
    }
  }

  async getFavoriteEntries(): Promise<EntryWithRelations[]> {
    try {
      const favoriteEntries = await db
        .select()
        .from(entries)
        .where(eq(entries.isFavorite, true));
        
      return Promise.all(favoriteEntries.map(entry => this.populateEntryRelations(entry)));
    } catch (error) {
      logger.error('Failed to get favorite entries', error);
      throw error;
    }
  }

  async toggleFavorite(id: number): Promise<EntryWithRelations | undefined> {
    try {
      // First get the current entry to check its isFavorite status
      const [entry] = await db
        .select()
        .from(entries)
        .where(eq(entries.id, id));
        
      if (!entry) return undefined;
      
      // Toggle the favorite status
      const [updatedEntry] = await db
        .update(entries)
        .set({ isFavorite: !entry.isFavorite })
        .where(eq(entries.id, id))
        .returning();
        
      return this.populateEntryRelations(updatedEntry);
    } catch (error: any) {
      logger.error(`Failed to toggle favorite status for entry with id ${id}`, error);
      throw error;
    }
  }

  // Helper methods
  private async updateEntryPeopleAssociations(entryId: number, peopleIds: number[]): Promise<void> {
    try {
      // First delete existing associations
      await db.delete(entryPeople).where(eq(entryPeople.entryId, entryId));
      
      // Then create new associations
      if (peopleIds.length > 0) {
        const associations = peopleIds.map(personId => ({
          entryId,
          personId
        }));
        
        await db.insert(entryPeople).values(associations);
      }
    } catch (error: any) {
      logger.error(`Failed to update entry-people associations for entry id ${entryId}`, error);
      throw error;
    }
  }

  private async populateEntryRelations(entry: Entry): Promise<EntryWithRelations> {
    try {
      // Get the emotion if exists
      let emotion: Emotion | undefined;
      if (entry.emotionId) {
        const [foundEmotion] = await db
          .select()
          .from(emotions)
          .where(eq(emotions.id, entry.emotionId));
        emotion = foundEmotion;
      }
      
      // Get the place if exists
      let place: Place | undefined;
      if (entry.placeId) {
        const [foundPlace] = await db
          .select()
          .from(places)
          .where(eq(places.id, entry.placeId));
        place = foundPlace;
      }
      
      // Get associated people
      const entryPeopleAssociations = await db
        .select()
        .from(entryPeople)
        .where(eq(entryPeople.entryId, entry.id));
        
      const peopleIds = entryPeopleAssociations.map(ep => ep.personId);
      
      let associatedPeople: Person[] = [];
      if (peopleIds.length > 0) {
        associatedPeople = await db
          .select()
          .from(people)
          .where(inArray(people.id, peopleIds));
      }
      
      return {
        ...entry,
        emotion,
        place,
        people: associatedPeople
      };
    } catch (error: any) {
      logger.error(`Failed to populate relations for entry id ${entry.id}`, error);
      throw new Error(`Failed to populate relations: ${error?.message || 'Unknown error'}`);
    }
  }
}

// Create singleton instance of the storage
export const storage = new DatabaseStorage();
