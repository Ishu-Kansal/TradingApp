import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/UserPages/Home.tsx";
import OptionsTables from "./pages/UserPages/OptionsTables.tsx";
import Old_Contract from "./pages/UserPages/Old_Contract.tsx";
import Database from "./pages/UserPages/Database.tsx";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import InitialLandingPage from "./pages/PublicPages/InitialLandingPage.tsx";
import RegisterPage from "./pages/PublicPages/RegisterPage.tsx";
import LoginPage from "./pages/PublicPages/LoginPage.tsx";
import NavBar from "./components/NavBar.tsx";
import LoginButtons from "./pages/PublicPages/LoginButtons.tsx";

function App() {
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    uri: `http://localhost:9090`,
  });

  return (
    <ApolloProvider client={client}>
      <div className="App">
        <Router>
          <NavBar />
          <Routes>
            <Route path="/" element={<InitialLandingPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/home" element={<Home />} />
            <Route path="/options-tables" element={<OptionsTables />} />
            <Route path="/:id" element={<Old_Contract />} />
            <Route path="/bid-ask-test" element={<Database />} />
            <Route path="/loginbuttons" element={<LoginButtons />} />
          </Routes>
        </Router>
      </div>
    </ApolloProvider>
  );
}

export default App;
