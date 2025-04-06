import { Search, Bell, Menu } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export default function Header({ onMobileMenuToggle }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast({
        title: "Search functionality",
        description: `Search for "${searchQuery}" functionality will be implemented in a future version.`,
      });
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
      <button 
        className="md:hidden rounded-md p-2 text-gray-600 hover:bg-gray-100"
        onClick={onMobileMenuToggle}
      >
        <Menu className="h-6 w-6" />
      </button>
      
      <form 
        className="relative flex-1 max-w-xl mx-4"
        onSubmit={handleSearch}
      >
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input 
          type="text" 
          placeholder="Search journals, emotions, people..." 
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary focus:border-primary text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>
      
      <div className="flex items-center space-x-3">
        <button 
          className="text-gray-600 hover:text-gray-900"
          onClick={() => toast({
            title: "Notifications",
            description: "Notification functionality will be available in a future update.",
          })}
        >
          <Bell className="h-6 w-6" />
        </button>
        <button className="md:hidden">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            S
          </div>
        </button>
      </div>
    </header>
  );
}
