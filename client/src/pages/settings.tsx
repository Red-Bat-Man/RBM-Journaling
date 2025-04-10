import { Separator } from "@/components/ui/separator";
import FontPicker from "@/components/settings/font-picker";
import FontSizePicker from "@/components/settings/font-size-picker";
import TextColorPicker from "@/components/settings/text-color-picker";
import BackupManager from "@/components/settings/backup-manager";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";

export default function Settings() {
  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/">
          <span className="inline-flex items-center text-muted-foreground hover:text-primary cursor-pointer">
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </span>
        </Link>
      </div>
      
      <div>
        <h1>Settings</h1>
        <p className="text-muted-foreground">
          Personalize your journal experience
        </p>
      </div>
      
      <Separator />
      
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-medium mb-4">Appearance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6 p-4 border rounded-md">
              <div>
                <h3 className="text-lg font-medium">Typography</h3>
                <p className="text-sm text-muted-foreground">
                  Choose how text appears throughout your journal
                </p>
              </div>
              
              <div className="space-y-6">
                <FontPicker />
                <FontSizePicker />
                <TextColorPicker />
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-medium mb-4">Data Management</h2>
          <div className="grid grid-cols-1 gap-6">
            <BackupManager />
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 py-4">
        <span className="text-sm text-muted-foreground">
          Settings are automatically saved when you make changes.
        </span>
      </div>
    </div>
  );
}