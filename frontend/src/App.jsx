import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import InputForm from "../components/InputForm";
import HomePage from "../components/HomePage";
import EditEmployee from "../components/EditEmployee";
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/add" element={<InputForm />} />
        <Route path="/edit/:id" element={<EditEmployee />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
