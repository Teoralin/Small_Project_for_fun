import React, {Profiler} from 'react';
import { Route, Routes } from 'react-router-dom';
import LoginPage from './pages/Login/LoginPage';
import HomePage from "./pages/Home/HomePage.jsx";
import RegisterPage from "./pages/Register/RegisterPage.jsx";
import UsersPage from "./pages/Users/UsersPage.jsx";
import FarmersPage from "./pages/Farmers/FarmersPage.jsx";
import ProfilePage from "./pages/Profile/ProfilePage.jsx";
import OrdersListPage from "./pages/OrdersList/OrdersListPage.jsx";
import OffersListPage from "./pages/OffersList/OffersListPage.jsx";
import SelfHarvestListPage from "./pages/SelfHarvestList/SelfHarvestListPage.jsx";
import EditUserListPage from "./pages/EditUsersList/EditUserListPage.jsx";
import EditUserPage from "./pages/EditUser/EditUserPage.jsx";
import EditCategoriesListPage from './pages/editCategoriesList/editCategoriesListPage';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/farmers" element={<FarmersPage />} />
            <Route path="/profile" element={<ProfilePage/>} />
            <Route path="/ordersList" element={<OrdersListPage />} />
            <Route path="/offersList" element={<OffersListPage />} />
            <Route path="/harvestList" element={<SelfHarvestListPage />} />
            <Route path="/editUsersList" element={<EditUserListPage />} />
            <Route path="/editUser/:id" element={<EditUserPage />} />
            <Route path='/editCategoriesList' element={<EditCategoriesListPage/>} />
        </Routes>
    )
}