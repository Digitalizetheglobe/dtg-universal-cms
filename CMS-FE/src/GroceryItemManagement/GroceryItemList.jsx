import React, { useState, useEffect } from 'react';
import { FaShoppingBasket, FaEdit, FaTrash, FaPlus, FaArrowLeft } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = 'http://localhost:5000/api';

const GroceryItemList = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/grocery-item-management`);
            if (response.data.success) {
                setItems(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching items:', error);
            toast.error('Failed to load grocery items');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await axios.delete(`${API_BASE_URL}/grocery-item-management/${id}`);
                toast.success('Grocery item deleted successfully');
                fetchItems();
            } catch (error) {
                console.error('Error deleting item:', error);
                toast.error('Failed to delete grocery item');
            }
        }
    };

    return (
        <div className="p-8 bg-[#F5F5DC] min-h-screen">
            <ToastContainer />
            {/* Header Section */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/donation-kit-management')}
                    className="flex items-center text-gray-500 hover:text-gray-700 mb-4 transition-colors"
                >
                    <FaArrowLeft className="mr-2" /> Back to Dashboard
                </button>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Grocery Items</h1>
                <p className="text-gray-600 text-lg">Manage grocery donation items.</p>
            </div>

            {/* Add New Item Button - Fixed at top right */}
            <div className="flex justify-end mb-6">
                <Link
                    to="/grocery-item-management/items/create"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg flex items-center font-medium transition-colors shadow-sm"
                >
                    <FaPlus className="mr-2" /> Add New Item
                </Link>
            </div>

            {/* List Section */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading items...</div>
                ) : items.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
                        No grocery items found. Create one to get started!
                    </div>
                ) : (
                    items.map((item) => (
                        <div
                            key={item._id}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6 transition-all hover:shadow-md"
                        >
                            {/* Icon */}
                            <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-[#FF6B35] rounded-lg flex items-center justify-center overflow-hidden">
                                {item.icon && item.icon.startsWith('http') ? (
                                    <img
                                        src={item.icon}
                                        alt={item.itemName}
                                        className="w-full h-full rounded-lg object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            if (!e.target.parentElement.querySelector('span')) {
                                                const emoji = document.createElement('span');
                                                emoji.textContent = item.icon || '🛒';
                                                emoji.className = 'text-4xl text-white';
                                                e.target.parentElement.appendChild(emoji);
                                            }
                                        }}
                                    />
                                ) : (
                                    <span className="text-white text-4xl">{item.icon || '🛒'}</span>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-grow flex flex-col justify-between py-2">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-gray-800">{item.itemName}</h3>
                                            <span className="bg-orange-100 text-orange-600 text-sm font-medium px-3 py-1 rounded-full">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 ml-4">
                                        <Link
                                            to={`/grocery-item-management/items/edit/${item._id}`}
                                            className="flex items-center text-orange-500 border border-orange-500 px-4 py-2 rounded-lg hover:bg-orange-50 text-sm font-medium transition-colors"
                                        >
                                            <FaEdit className="mr-2" /> Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="flex items-center text-red-500 border border-red-500 px-4 py-2 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors"
                                        >
                                            <FaTrash className="mr-2" /> Delete
                                        </button>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="flex items-center">
                                    <span className="text-orange-500 font-bold text-xl">
                                        ₹{Number(item.price).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default GroceryItemList;

