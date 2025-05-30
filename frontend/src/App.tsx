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
import ProfitCalc from "./pages/UserPages/ProfitCalc.tsx";
import PricingPage from "./pages/PublicPages/PricingPage.tsx";
import HVCharts from "./pages/UserPages/HVCharts.tsx";
import FeaturePage from "./pages/PublicPages/FeaturePage.tsx";
import ScrollToTop from "./components/ScrollToTop.tsx";
import AboutPage from "./pages/PublicPages/AboutPage.tsx";
import GEX from "./pages/UserPages/GEX.tsx";

function App() {
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    uri: `http://localhost:9090`,
  });

  return (
    <ApolloProvider client={client}>
      <div className="App">
        <Router>
          <ScrollToTop />
          <NavBar />
          <Routes>
            <Route path="/" element={<InitialLandingPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/home" element={<Home />} />
            <Route path="/options-tables" element={<OptionsTables />} />
            <Route path="/:id" element={<Old_Contract />} />
            <Route path="/bid-ask-test" element={<Database />} />
            <Route path="/profit-calc" element={<ProfitCalc />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/hist-iv-charts" element={<HVCharts />} />
            <Route path="/features" element={<FeaturePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/gex" element={<GEX />} />
          </Routes>
        </Router>
      </div>
    </ApolloProvider>
  );
}

export default App;
