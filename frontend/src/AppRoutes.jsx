import React, {Profiler} from 'react';
import { Route, Routes } from 'react-router-dom';
import LoginPage from './pages/Login/LoginPage';
import HomePage from "./pages/Home/HomePage.jsx";
import RegisterPage from "./pages/Register/RegisterPage.jsx";
import UsersPage from "./pages/Users/UsersPage.jsx";
import FarmersPage from "./pages/Farmers/FarmersPage.jsx";
import ProfilePage from "./pages/Profile/ProfilePage.jsx";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/farmers" element={<FarmersPage />} />
            <Route path="/profile" element={<ProfilePage/>} />
        </Routes>
    )
}