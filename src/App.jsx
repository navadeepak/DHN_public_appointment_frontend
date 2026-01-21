import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Navbar from "./layouts/Navbar";
import StarterPage from "./pages/checkingPages/StarterPage";
import Doctors from "./pages/checkingPages/Doctors";
import TargetedDentist from "./pages/checkingPages/TargetedDentist";
import { Login, Register } from "./pages/loginAndRegister/LoginAndRegister"; // Adjust path as needed (e.g., if in a separate file)

function AppContent() {
  const location = useLocation();
  const { pathname } = location;
  const isAuthPage = ['/', '/login', '/register'].includes(pathname);
  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-linear-65 to-teal-500 from-blue-500 ">
      {!isAuthPage && <Navbar />}
      <div className={`w-screen ${isAuthPage ? 'h-screen' : 'h-[92vh]'} flex justify-center`}>
        {isAuthPage ? (
          <div className="w-full h-full overflow-auto flex flex-row">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/starter" element={<StarterPage />} />
              <Route path="/doctors" element={<Doctors />} />
              <Route path="/dentist" element={<TargetedDentist />} />
            </Routes>
          </div>
        ) : (
          <div className="bg-white/50 w-full overflow-auto">
            <div className="overflow-auto flex flex-row w-full h-full">
              <Routes>
                <Route path="/starter" element={<StarterPage />} />
                <Route path="/doctors" element={<Doctors />} />
                <Route path="/dentist" element={<TargetedDentist />} />
              </Routes>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;