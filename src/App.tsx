import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./routes/Home.tsx";
import Old_Contract from "./routes/Old_Contract.tsx";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:id" element={<Old_Contract />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
