import { Utensils, ShoppingCart, Refrigerator, Menu, Calendar, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navigationItems = [
    { path: "/recipes", icon: Utensils, label: "Recipes" },
    { path: "/shopping", icon: ShoppingCart, label: "Shopping" },
    { path: "/storage", icon: Refrigerator, label: "Storage" },
    { path: "/meal-planner", icon: Calendar, label: "Meal Planner" },
  ];

  const menuItems = [
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  const NavigationButton = ({ path, Icon, label }: { path: string; Icon: any; label: string }) => (
    <button
      onClick={() => {
        navigate(path);
        setIsOpen(false);
      }}
      className={`flex flex-col items-center p-2 ${
        isActive(path) ? "text-sage" : "text-forest"
      }`}
    >
      <Icon className="h-6 w-6" />
      <span className="text-xs mt-1 whitespace-nowrap">{label}</span>
    </button>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-cream border-t border-sage">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex justify-between py-2">
          {navigationItems.map(({ path, icon: Icon, label }) => (
            <NavigationButton key={path} path={path} Icon={Icon} label={label} />
          ))}
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center p-2 text-forest">
                <Menu className="h-6 w-6" />
                <span className="text-xs mt-1 whitespace-nowrap">More</span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[180px] bg-cream">
              <SheetHeader>
                <SheetTitle className="text-forest">Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-3 mt-3">
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