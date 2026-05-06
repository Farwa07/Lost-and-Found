import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Persons from "./pages/Persons";
import Items from "./pages/Items";
import Statistics from "./pages/Statistics";
import Contact from "./pages/Contact";
import MyReports from "./pages/MyReports";
import Notifications from "./pages/Notifications";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}>
          <Route path="profile" element={<Profile />} />
          <Route path="persons" element={<Persons />} />
          <Route path="items" element={<Items />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="contact" element={<Contact />} />
          <Route path="reports" element={<MyReports />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;