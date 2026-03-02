import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Workers from "./pages/Workers.jsx";
import Workstations from "./pages/Workstations.jsx";
import Layout from "./components/Layout.jsx";
import "./app.css";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="workers" element={<Workers />} />
            <Route path="workstations" element={<Workstations />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
