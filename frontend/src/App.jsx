import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";

import Persons from "./pages/Persons";
import MissingPerson from "./pages/MissingPerson";
import FoundPerson from "./pages/FoundPerson";

import Items from "./pages/Items";
import LostItem from "./pages/LostItem";
import FoundItem from "./pages/FoundItem";

import Statistics from "./pages/Statistics";
import Contact from "./pages/Contact";
import MyReports from "./pages/MyReports";

import SignUp from "./pages/SignUp";


import Login from "./pages/Login";



export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/persons" element={<Persons />} />
        <Route path="/items" element={<Items />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/reports" element={<MyReports />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/report-missing-person" element={<MissingPerson />} />
        <Route path="/report-found-person" element={<FoundPerson />} />
        <Route path="/login" element={<Login />} />
        <Route path="/report-lost-item" element={<LostItem />} />
        <Route path="/report-found-item" element={<FoundItem />} />
        
        
      </Routes>
    </BrowserRouter>
  );
}