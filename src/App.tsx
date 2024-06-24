import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.tsx";
import OptionsTables from "./pages/OptionsTables.tsx";
import Old_Contract from "./pages/Old_Contract.tsx";
import Database from "./pages/Database.tsx";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/options-tables" element={<OptionsTables />} />
          <Route path="/:id" element={<Old_Contract />} />
          <Route path="/bid-ask-test" element={<Database />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
