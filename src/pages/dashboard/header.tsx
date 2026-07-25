import { UserData } from "@/types/auth";
import { ChevronUp, LayoutGrid } from "lucide-react";

interface HeaderProps {
    bio: UserData | null;
    isOpen: boolean;
    setIsOpen: Function
  }

export default function Header({
  bio,
  isOpen,
  setIsOpen
}: Readonly<HeaderProps>) {
  
  return (
    <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Hello {bio?.firstname}</h1>
        </div>

        <div className="flex items-center gap-3">        
          <button
            onClick={() => setIsOpen((prev:any) => !prev)}
            className="border p-2 rounded-lg hover:bg-gray-50 transition"
            title={isOpen ? "Hide Widgets" : "Show Widgets"}
          >
            {isOpen ? <ChevronUp size={18} /> : <LayoutGrid size={18} />}
          </button>
        </div>
      </div>
  );
}