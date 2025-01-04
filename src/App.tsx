import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import "./App.css";
import "./styles/typography.css";

function App() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}

export default App;