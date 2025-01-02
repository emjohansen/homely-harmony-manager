import { Utensils, ShoppingCart, CalendarClock, ClipboardList, Refrigerator, Settings, Menu } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navigationItems = [
    { path: "/recipes", icon: Utensils, label: "Oppskrifter" },
    { path: "/shopping", icon: ShoppingCart, label: "Handleliste" },
    { path: "/reminders", icon: CalendarClock, label: "Påminnelser" },
    { path: "/chores", icon: ClipboardList, label: "Gjøremål" },
    { path: "/storage", icon: Refrigerator, label: "Lagring" },
    { path: "/settings", icon: Settings, label: "Innstillinger" },
  ];

  const mainItems = navigationItems.slice(0, 4);
  const menuItems = navigationItems.slice(4);

  const NavigationButton = ({ path, Icon, label }: { path: string; Icon: any; label: string }) => (
    <button
      onClick={() => {
        navigate(path);
        setIsOpen(false);
      }}
      className={`flex flex-col items-center p-2 ${
        isActive(path) ? "text-blue-600" : "text-gray-600"
      }`}
    >
      <Icon className="h-6 w-6" />
      <span className="text-xs mt-1 whitespace-nowrap">{label}</span>
    </button>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex justify-between py-2">
          {mainItems.map(({ path, icon: Icon, label }) => (
            <NavigationButton key={path} path={path} Icon={Icon} label={label} />
          ))}
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center p-2 text-gray-600">
                <Menu className="h-6 w-6" />
                <span className="text-xs mt-1 whitespace-nowrap">Mer</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[200px]">
              <div className="flex justify-around py-4">
                {menuItems.map(({ path, icon: Icon, label }) => (
                  <NavigationButton key={path} path={path} Icon={Icon} label={label} />
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};

export default Navigation;