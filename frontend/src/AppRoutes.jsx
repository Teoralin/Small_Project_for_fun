import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LoginPage from './pages/Login/LoginPage';
import HomePage from "./pages/Home/HomePage.jsx";
import RegisterPage from "./pages/Register/RegisterPage.jsx";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
        </Routes>
    )
}