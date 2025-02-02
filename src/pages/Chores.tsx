import Navigation from "@/components/Navigation";
import { ClipboardList } from "lucide-react";

const Chores = () => {
  return (
    <div className="min-h-screen bg-cream pb-16">
      <div 
        className="relative h-[40vh] flex flex-col items-center justify-center overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: 'url("/lovable-uploads/7e24e64e-7cc7-4287-8a2e-41e46382fd65.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <ClipboardList className="absolute opacity-10 h-64 w-64 text-cream transform -translate-y-8" />
        <h1 className="relative text-5xl font-bold mb-4 text-cream uppercase tracking-wider">CHORES</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        <p className="text-gray-500">Chores feature coming soon!</p>
      </div>
      <Navigation />
    </div>
  );
};

export default Chores;