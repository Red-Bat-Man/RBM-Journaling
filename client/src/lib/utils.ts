import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "MMMM d, yyyy");
}

export function formatTimeAgo(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function generateUserInitials(name: string): string {
  if (!name) return "U";
  const parts = name.split(" ");
  
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export const EMOTIONS_WITH_COLORS = [
  { name: "Happy", emoji: "😊", color: "#818CF8" },
  { name: "Sad", emoji: "😔", color: "#60A5FA" },
  { name: "Angry", emoji: "😡", color: "#EF4444" },
  { name: "Calm", emoji: "😌", color: "#34D399" },
  { name: "Anxious", emoji: "😰", color: "#F59E0B" },
  { name: "Loved", emoji: "🥰", color: "#EC4899" },
  { name: "Excited", emoji: "🤩", color: "#8B5CF6" },
  { name: "Frustrated", emoji: "😤", color: "#F97316" },
];

export function getEmotionColorClass(emotionName?: string): string {
  if (!emotionName) return "bg-indigo-100 text-primary";
  
  const emotion = EMOTIONS_WITH_COLORS.find(e => e.name.toLowerCase() === emotionName.toLowerCase());
  
  switch (emotionName.toLowerCase()) {
    case "happy":
      return "bg-indigo-100 text-primary";
    case "sad":
      return "bg-blue-100 text-blue-800";
    case "angry":
      return "bg-red-100 text-red-800";
    case "calm":
      return "bg-emerald-100 text-emerald-800";
    case "anxious":
      return "bg-amber-100 text-amber-800";
    case "loved":
      return "bg-pink-100 text-pink-800";
    case "excited":
      return "bg-purple-100 text-secondary";
    case "frustrated":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
