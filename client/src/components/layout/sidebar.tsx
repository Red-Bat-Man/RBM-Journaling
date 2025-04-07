import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  BookOpen, 
  SmilePlus, 
  Users, 
  MapPin,
  Bookmark, 
  Settings,
  X
} from "lucide-react";

interface SidebarProps {
  mobileMenuOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ mobileMenuOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  
  const navItems = [
    { 
      name: "Home", 
      path: "/", 
      icon: <Home className="h-5 w-5 mr-3" />,
      active: location === "/"
    },
    { 
      name: "All Journals", 
      path: "/journals", 
      icon: <BookOpen className="h-5 w-5 mr-3" />,
      active: location === "/journals"
    },
    { 
      name: "Emotions", 
      path: "/emotions", 
      icon: <SmilePlus className="h-5 w-5 mr-3" />,
      active: location === "/emotions"
    },
    { 
      name: "People", 
      path: "/people", 
      icon: <Users className="h-5 w-5 mr-3" />,
      active: location === "/people"
    },
    { 
      name: "Places", 
      path: "/places", 
      icon: <MapPin className="h-5 w-5 mr-3" />,
      active: location === "/places"
    },
    { 
      name: "Bookmarks", 
      path: "/bookmarks", 
      icon: <Bookmark className="h-5 w-5 mr-3" />,
      active: location === "/bookmarks"
    },
    { 
      name: "Settings", 
      path: "/settings", 
      icon: <Settings className="h-5 w-5 mr-3" />,
      active: location === "/settings"
    }
  ];

  const sidebarClasses = cn(
    "flex flex-col w-64 bg-white border-r border-gray-200 p-4 h-full",
    "fixed inset-y-0 left-0 z-50 transition-transform duration-300 transform",
    "md:relative md:translate-x-0",
    mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
  );

  return (
    <aside className={sidebarClasses}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl">
            R
          </div>
          <h1 className="ml-3 text-xl font-semibold text-gray-800">RBM</h1>
        </div>
        <button 
          onClick={onClose}
          className="md:hidden text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link href={item.path}>
                <div
                  className={cn(
                    "flex items-center px-4 py-3 rounded-lg font-medium cursor-pointer sidebar-link",
                    item.active
                      ? "text-primary bg-indigo-50"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  {item.icon}
                  {item.name}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="mt-auto pt-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            S
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">Sarah Johnson</p>
            <p className="text-xs text-gray-500">sarah@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
