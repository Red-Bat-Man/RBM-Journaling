import { useState, useRef } from 'react';
import { exportJournalBackup, importJournalBackup } from '@/lib/backup-utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Download, Upload, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useEntries } from '@/hooks/use-journal';

export default function BackupManager() {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: entries = [] } = useEntries();
  
  const handleExport = async () => {
    try {
      setIsExporting(true);
      setImportError(null);

      // Fetch all necessary data
      const emotionsResponse = await apiRequest('GET', '/api/emotions');
      const emotions = await emotionsResponse.json();
      
      const peopleResponse = await apiRequest('GET', '/api/people');
      const people = await peopleResponse.json();
      
      const placesResponse = await apiRequest('GET', '/api/places');
      const places = await placesResponse.json();
      
      // Perform export
      await exportJournalBackup(entries, emotions, people, places);
      
      toast({
        title: 'Backup successful',
        description: 'Your journal has been successfully backed up.',
      });
    } catch (error) {
      toast({
        title: 'Backup failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setImportError(null);

      // Read and validate the backup file
      const backupData = await importJournalBackup(file);

      // Import emotions first (dependencies for entries)
      for (const emotion of backupData.emotions) {
        try {
          await apiRequest('POST', '/api/emotions', {
            name: emotion.name,
            emoji: emotion.emoji || '😊',
            color: emotion.color
          });
        } catch (error) {
          // Ignore if emotion already exists
          console.log(`Emotion ${emotion.name} may already exist`);
        }
      }

      // Import people
      for (const person of backupData.people) {
        try {
          await apiRequest('POST', '/api/people', {
            name: person.name
          });
        } catch (error) {
          // Ignore if person already exists
          console.log(`Person ${person.name} may already exist`);
        }
      }

      // Import places
      for (const place of backupData.places) {
        try {
          await apiRequest('POST', '/api/places', {
            name: place.name,
            icon: place.icon
          });
        } catch (error) {
          // Ignore if place already exists
          console.log(`Place ${place.name} may already exist`);
        }
      }

      // Import entries
      for (const entry of backupData.entries) {
        try {
          await apiRequest('POST', '/api/entries', {
            entry: {
              title: entry.title,
              content: entry.content,
              emotionId: entry.emotion?.id,
              placeId: entry.place?.id,
              isFavorite: entry.isFavorite
            },
            peopleIds: entry.people.map(p => p.id)
          });
        } catch (error) {
          console.error('Failed to import entry:', entry.title, error);
        }
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/emotions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/people'] });
      queryClient.invalidateQueries({ queryKey: ['/api/places'] });

      toast({
        title: 'Import successful',
        description: `Successfully imported ${backupData.entries.length} journal entries.`,
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Failed to import backup');
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Backup & Restore</CardTitle>
        <CardDescription>
          Export your journal to a file for safekeeping or import a previously created backup.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {importError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Import Error</AlertTitle>
            <AlertDescription>{importError}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Backup Your Journal</h3>
          <p className="text-sm text-muted-foreground">
            Create a backup file containing all your journal entries, emotions, people, and places.
          </p>
          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            className="w-full sm:w-auto"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export Backup
              </>
            )}
          </Button>
        </div>
        
        <div className="space-y-2 pt-4">
          <h3 className="text-sm font-medium">Restore From Backup</h3>
          <p className="text-sm text-muted-foreground">
            Import a previously created backup file to restore your journal entries.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handleImportClick} 
              disabled={isImporting}
              className="w-full sm:w-auto"
              variant="outline"
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Select Backup File
                </>
              )}
            </Button>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <p className="text-xs text-muted-foreground">
          Note: Importing a backup will add entries to your journal; it won't delete existing entries.
        </p>
      </CardFooter>
    </Card>
  );
}