import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, ProtectedRoute } from './components/layout';
import useAuthStore from './stores/authStore';
import useNotificationStore from './stores/notificationStore';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Items from './pages/Items';
import ItemDetail from './pages/ItemDetail';
import MyItems from './pages/MyItems';
import CreateItem from './pages/CreateItem';
import EditItem from './pages/EditItem';
import Transactions from './pages/Transactions';
import TransactionDetail from './pages/TransactionDetail';
import Requests from './pages/Requests';
import Notifications from './pages/Notifications';
import LostFound from './pages/LostFound';

function App() {
    const { checkAuth, isAuthenticated } = useAuthStore();
    const { fetchUnreadCount, setupSocketListeners } = useNotificationStore();

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchUnreadCount();
            setupSocketListeners();
        }
    }, [isAuthenticated]);

    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/items" element={<Items />} />
                    <Route path="/items/:id" element={<ItemDetail />} />

                    {/* Protected Routes */}
                    <Route path="/profile" element={
                        <ProtectedRoute><Profile /></ProtectedRoute>
                    } />
                    <Route path="/my-items" element={
                        <ProtectedRoute><MyItems /></ProtectedRoute>
                    } />
                    <Route path="/my-items/new" element={
                        <ProtectedRoute><CreateItem /></ProtectedRoute>
                    } />
                    <Route path="/my-items/:id/edit" element={
                        <ProtectedRoute><EditItem /></ProtectedRoute>
                    } />
                    <Route path="/transactions" element={
                        <ProtectedRoute><Transactions /></ProtectedRoute>
                    } />
                    <Route path="/transactions/:id" element={
                        <ProtectedRoute><TransactionDetail /></ProtectedRoute>
                    } />
                    <Route path="/requests" element={
                        <ProtectedRoute><Requests /></ProtectedRoute>
                    } />
                    <Route path="/notifications" element={
                        <ProtectedRoute><Notifications /></ProtectedRoute>
                    } />
                    <Route path="/lost-found" element={
                        <ProtectedRoute><LostFound /></ProtectedRoute>
                    } />

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
