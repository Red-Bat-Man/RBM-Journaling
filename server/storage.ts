import { 
  users, type User, type InsertUser,
  emotions, type Emotion, type InsertEmotion,
  people, type Person, type InsertPerson,
  entries, type Entry, type InsertEntry,
  entryPeople, type EntryPerson, type InsertEntryPerson,
  type EntryWithRelations
} from "@shared/schema";

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

  // Entry operations
  getEntries(): Promise<EntryWithRelations[]>;
  getEntry(id: number): Promise<EntryWithRelations | undefined>;
  createEntry(entry: InsertEntry, peopleIds?: number[]): Promise<EntryWithRelations>;
  updateEntry(id: number, entry: Partial<InsertEntry>, peopleIds?: number[]): Promise<EntryWithRelations | undefined>;
  deleteEntry(id: number): Promise<boolean>;
  getEntriesByEmotion(emotionId: number): Promise<EntryWithRelations[]>;
  getEntriesByPerson(personId: number): Promise<EntryWithRelations[]>;
  getFavoriteEntries(): Promise<EntryWithRelations[]>;
  toggleFavorite(id: number): Promise<EntryWithRelations | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private emotions: Map<number, Emotion>;
  private people: Map<number, Person>;
  private entries: Map<number, Entry>;
  private entryPeople: Map<number, EntryPerson>;
  
  private userCurrentId: number;
  private emotionCurrentId: number;
  private personCurrentId: number;
  private entryCurrentId: number;
  private entryPersonCurrentId: number;

  constructor() {
    this.users = new Map();
    this.emotions = new Map();
    this.people = new Map();
    this.entries = new Map();
    this.entryPeople = new Map();
    
    this.userCurrentId = 1;
    this.emotionCurrentId = 1;
    this.personCurrentId = 1;
    this.entryCurrentId = 1;
    this.entryPersonCurrentId = 1;

    // Initialize with default emotions
    this.initDefaultEmotions();
  }

  private initDefaultEmotions() {
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

    defaultEmotions.forEach(emotion => {
      this.createEmotion(emotion);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Emotion operations
  async getEmotions(): Promise<Emotion[]> {
    return Array.from(this.emotions.values());
  }

  async getEmotion(id: number): Promise<Emotion | undefined> {
    return this.emotions.get(id);
  }

  async createEmotion(insertEmotion: InsertEmotion): Promise<Emotion> {
    const id = this.emotionCurrentId++;
    const emotion: Emotion = { ...insertEmotion, id };
    this.emotions.set(id, emotion);
    return emotion;
  }

  async updateEmotion(id: number, updateData: Partial<InsertEmotion>): Promise<Emotion | undefined> {
    const emotion = this.emotions.get(id);
    if (!emotion) return undefined;

    const updatedEmotion = { ...emotion, ...updateData };
    this.emotions.set(id, updatedEmotion);
    return updatedEmotion;
  }

  async deleteEmotion(id: number): Promise<boolean> {
    return this.emotions.delete(id);
  }

  // Person operations
  async getPeople(): Promise<Person[]> {
    return Array.from(this.people.values());
  }

  async getPerson(id: number): Promise<Person | undefined> {
    return this.people.get(id);
  }

  async createPerson(insertPerson: InsertPerson): Promise<Person> {
    const id = this.personCurrentId++;
    const person: Person = { ...insertPerson, id };
    this.people.set(id, person);
    return person;
  }

  async updatePerson(id: number, updateData: Partial<InsertPerson>): Promise<Person | undefined> {
    const person = this.people.get(id);
    if (!person) return undefined;

    const updatedPerson = { ...person, ...updateData };
    this.people.set(id, updatedPerson);
    return updatedPerson;
  }

  async deletePerson(id: number): Promise<boolean> {
    // First, remove all references to this person in entryPeople
    const entryPeopleToDelete = Array.from(this.entryPeople.values())
      .filter(ep => ep.personId === id);
      
    entryPeopleToDelete.forEach(ep => {
      this.entryPeople.delete(ep.id);
    });

    return this.people.delete(id);
  }

  // Entry operations
  async getEntries(): Promise<EntryWithRelations[]> {
    const entries = Array.from(this.entries.values());
    return Promise.all(entries.map(entry => this.populateEntryRelations(entry)));
  }

  async getEntry(id: number): Promise<EntryWithRelations | undefined> {
    const entry = this.entries.get(id);
    if (!entry) return undefined;
    return this.populateEntryRelations(entry);
  }

  async createEntry(insertEntry: InsertEntry, peopleIds: number[] = []): Promise<EntryWithRelations> {
    const id = this.entryCurrentId++;
    const now = new Date();
    
    // Set createdAt to current time
    const entry: Entry = { 
      ...insertEntry, 
      id, 
      createdAt: now 
    };
    
    this.entries.set(id, entry);

    // Associate people with this entry
    await this.updateEntryPeopleAssociations(id, peopleIds);

    return this.populateEntryRelations(entry);
  }

  async updateEntry(id: number, updateData: Partial<InsertEntry>, peopleIds?: number[]): Promise<EntryWithRelations | undefined> {
    const entry = this.entries.get(id);
    if (!entry) return undefined;

    const updatedEntry = { ...entry, ...updateData };
    this.entries.set(id, updatedEntry);

    // Update people associations if provided
    if (peopleIds !== undefined) {
      await this.updateEntryPeopleAssociations(id, peopleIds);
    }

    return this.populateEntryRelations(updatedEntry);
  }

  async deleteEntry(id: number): Promise<boolean> {
    // First, remove all associations to people
    const entryPeopleToDelete = Array.from(this.entryPeople.values())
      .filter(ep => ep.entryId === id);
      
    entryPeopleToDelete.forEach(ep => {
      this.entryPeople.delete(ep.id);
    });

    return this.entries.delete(id);
  }

  async getEntriesByEmotion(emotionId: number): Promise<EntryWithRelations[]> {
    const entries = Array.from(this.entries.values())
      .filter(entry => entry.emotionId === emotionId);
      
    return Promise.all(entries.map(entry => this.populateEntryRelations(entry)));
  }

  async getEntriesByPerson(personId: number): Promise<EntryWithRelations[]> {
    // Find all entry IDs associated with this person
    const entryIds = Array.from(this.entryPeople.values())
      .filter(ep => ep.personId === personId)
      .map(ep => ep.entryId);
      
    // Get those entries
    const entries = Array.from(this.entries.values())
      .filter(entry => entryIds.includes(entry.id));
      
    return Promise.all(entries.map(entry => this.populateEntryRelations(entry)));
  }

  async getFavoriteEntries(): Promise<EntryWithRelations[]> {
    const entries = Array.from(this.entries.values())
      .filter(entry => entry.isFavorite);
      
    return Promise.all(entries.map(entry => this.populateEntryRelations(entry)));
  }

  async toggleFavorite(id: number): Promise<EntryWithRelations | undefined> {
    const entry = this.entries.get(id);
    if (!entry) return undefined;

    const updatedEntry = { 
      ...entry, 
      isFavorite: !entry.isFavorite 
    };
    
    this.entries.set(id, updatedEntry);
    return this.populateEntryRelations(updatedEntry);
  }

  // Helper methods
  private async updateEntryPeopleAssociations(entryId: number, peopleIds: number[]): Promise<void> {
    // Remove existing associations
    const existingAssociations = Array.from(this.entryPeople.values())
      .filter(ep => ep.entryId === entryId);
      
    existingAssociations.forEach(ep => {
      this.entryPeople.delete(ep.id);
    });

    // Create new associations
    for (const personId of peopleIds) {
      if (this.people.has(personId)) {
        const id = this.entryPersonCurrentId++;
        const entryPerson: EntryPerson = {
          id,
          entryId,
          personId
        };
        this.entryPeople.set(id, entryPerson);
      }
    }
  }

  private async populateEntryRelations(entry: Entry): Promise<EntryWithRelations> {
    // Get the emotion
    const emotion = entry.emotionId 
      ? this.emotions.get(entry.emotionId) 
      : undefined;

    // Get associated people
    const entryPeopleAssociations = Array.from(this.entryPeople.values())
      .filter(ep => ep.entryId === entry.id);
      
    const peopleIds = entryPeopleAssociations.map(ep => ep.personId);
    
    const associatedPeople = Array.from(this.people.values())
      .filter(person => peopleIds.includes(person.id));

    return {
      ...entry,
      emotion,
      people: associatedPeople
    };
  }
}

export const storage = new MemStorage();
