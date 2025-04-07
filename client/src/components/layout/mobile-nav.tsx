import { Link, useLocation } from "wouter";
import { Home, BookOpen, Plus, SmilePlus, Users, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import EntryEditor from "@/components/journal/entry-editor";

export default function MobileNav() {
  const [location] = useLocation();
  const [showNewEntryEditor, setShowNewEntryEditor] = useState(false);
  
  return (
    <>
      <nav className="md:hidden bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-10">
        <div className="flex justify-around items-center">
          <Link href="/">
            <div className={cn(
              "flex flex-col items-center p-3 cursor-pointer font-medium",
              location === "/" ? "text-primary" : "text-gray-600"
            )}>
              <Home className="h-6 w-6" />
              <span className="text-xs mt-1">Home</span>
            </div>
          </Link>
          
          <Link href="/journals">
            <div className={cn(
              "flex flex-col items-center p-3 cursor-pointer font-medium",
              location === "/journals" ? "text-primary" : "text-gray-600"
            )}>
              <BookOpen className="h-6 w-6" />
              <span className="text-xs mt-1">Journals</span>
            </div>
          </Link>
          
          <button 
            onClick={() => setShowNewEntryEditor(true)}
            className="flex flex-col items-center p-3 bg-primary text-white rounded-full -mt-5 shadow-lg font-medium"
          >
            <Plus className="h-6 w-6" />
            <span className="text-xs mt-1">New</span>
          </button>
          
          <Link href="/emotions">
            <div className={cn(
              "flex flex-col items-center p-3 cursor-pointer font-medium",
              location === "/emotions" ? "text-primary" : "text-gray-600"
            )}>
              <SmilePlus className="h-6 w-6" />
              <span className="text-xs mt-1">Emotions</span>
            </div>
          </Link>
          
          <Link href="/people">
            <div className={cn(
              "flex flex-col items-center p-3 cursor-pointer font-medium",
              location === "/people" ? "text-primary" : "text-gray-600"
            )}>
              <Users className="h-6 w-6" />
              <span className="text-xs mt-1">People</span>
            </div>
          </Link>
          
          <Link href="/places">
            <div className={cn(
              "flex flex-col items-center p-3 cursor-pointer font-medium",
              location === "/places" ? "text-primary" : "text-gray-600"
            )}>
              <MapPin className="h-6 w-6" />
              <span className="text-xs mt-1">Places</span>
            </div>
          </Link>
        </div>
      </nav>
      
      {showNewEntryEditor && (
        <EntryEditor
          isOpen={showNewEntryEditor}
          onClose={() => setShowNewEntryEditor(false)}
        />
      )}
    </>
  );
}
