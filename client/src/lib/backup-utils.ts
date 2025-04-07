import { EntryWithRelations } from "@shared/schema";

// Define the shape of our backup data
export interface JournalBackupData {
  version: string;
  createdAt: string;
  entries: EntryWithRelations[];
  emotions: Array<{ id: number; name: string; emoji: string; color: string }>;
  people: Array<{ id: number; name: string }>;
  places: Array<{ id: number; name: string; icon?: string }>;
}

/**
 * Creates a backup file of journal entries and related data
 */
export async function exportJournalBackup(
  entries: EntryWithRelations[],
  emotions: Array<{ id: number; name: string; emoji: string; color: string }>,
  people: Array<{ id: number; name: string }>,
  places: Array<{ id: number; name: string; icon?: string }>
): Promise<void> {
  // Prepare backup data
  const backupData: JournalBackupData = {
    version: "1.0.0",
    createdAt: new Date().toISOString(),
    entries,
    emotions: emotions.map(e => ({
      id: e.id,
      name: e.name,
      emoji: e.emoji || '😊', // Provide default emoji if missing
      color: e.color
    })),
    people,
    places: places.map(p => ({
      id: p.id,
      name: p.name,
      icon: p.icon
    }))
  };

  // Convert data to JSON
  const jsonData = JSON.stringify(backupData, null, 2);

  // Create blob from JSON
  const blob = new Blob([jsonData], { type: "application/json" });

  // Generate filename with date
  const now = new Date();
  const formattedDate = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const filename = `journal-backup-${formattedDate}.json`;

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Reads backup file and returns data
 */
export function importJournalBackup(
  file: File
): Promise<JournalBackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string);
        // Validate backup data structure
        if (!jsonData.version || !jsonData.entries) {
          throw new Error("Invalid backup file format");
        }
        
        resolve(jsonData as JournalBackupData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read backup file"));
    };

    reader.readAsText(file);
  });
}