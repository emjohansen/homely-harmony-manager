import { House, ShoppingCart, CalendarClock, ClipboardList, Refrigerator } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex justify-between py-2">
          <button
            onClick={() => navigate("/recipes")}
            className={`flex flex-col items-center p-2 ${
              isActive("/recipes") ? "text-blue-600" : "text-gray-600"
            }`}
          >
            <House className="h-6 w-6" />
            <span className="text-xs mt-1">{t('navigation.recipes')}</span>
          </button>
          <button
            onClick={() => navigate("/shopping")}
            className={`flex flex-col items-center p-2 ${
              isActive("/shopping") ? "text-blue-600" : "text-gray-600"
            }`}
          >
            <ShoppingCart className="h-6 w-6" />
            <span className="text-xs mt-1">{t('navigation.shopping')}</span>
          </button>
          <button
            onClick={() => navigate("/reminders")}
            className={`flex flex-col items-center p-2 ${
              isActive("/reminders") ? "text-blue-600" : "text-gray-600"
            }`}
          >
            <CalendarClock className="h-6 w-6" />
            <span className="text-xs mt-1">{t('navigation.reminders')}</span>
          </button>
          <button
            onClick={() => navigate("/chores")}
            className={`flex flex-col items-center p-2 ${
              isActive("/chores") ? "text-blue-600" : "text-gray-600"
            }`}
          >
            <ClipboardList className="h-6 w-6" />
            <span className="text-xs mt-1">{t('navigation.chores')}</span>
          </button>
          <button
            onClick={() => navigate("/storage")}
            className={`flex flex-col items-center p-2 ${
              isActive("/storage") ? "text-blue-600" : "text-gray-600"
            }`}
          >
            <Refrigerator className="h-6 w-6" />
            <span className="text-xs mt-1">{t('navigation.storage')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navigation;