import Navigation from "@/components/Navigation";
import { useTranslation } from "react-i18next";

const Storage = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Lagring</h1>
        <p className="text-gray-500">Lagringsfunksjon kommer snart!</p>
      </div>
      <Navigation />
    </div>
  );
};

export default Storage;