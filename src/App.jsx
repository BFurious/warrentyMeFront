import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/login";
import Dashboard from "./components/dashboard";
import AuthWrapper from "./components/authWrapper"; 

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard /> } />
      </Routes>
    </Router>
  );
}

export default App;
