import React from 'react';
import {
    FaHeart,
    FaShoppingBasket,
    FaUsers,
    FaPlus,
    FaBullhorn,
    FaCrown,
    FaVideo,
    FaImages
} from 'react-icons/fa';

import { useNavigate } from 'react-router-dom';

const DonationKitManagement = () => {
    const navigate = useNavigate();

    const cards = [
        {
            id: 1,
            title: 'Donation Kits',
            description: 'Manage your "Donate to a Cause" section kits',
            icon: <FaHeart className="text-orange-500 text-xl" />,
            iconBg: 'bg-orange-100',
            buttonText: 'Manage Kits',
            onManage: () => navigate('/donation-kit-management/kits'),
            onAdd: () => navigate('/donation-kit-management/kits'), // Per user request, opens the List View
        },
        {
            id: 3,
            title: 'Grocery Items',
            description: 'Manage grocery donation items',
            icon: <FaShoppingBasket className="text-orange-500 text-xl" />,
            iconBg: 'bg-orange-100',
            buttonText: 'Manage Items',
            onManage: () => navigate('/grocery-item-management/items'),
            onAdd: () => navigate('/grocery-item-management/items/create'),
        },
        {
            id: 4,
            title: 'Campaigner Campaigns',
            description: 'Manage personal fundraising campaigns',
            icon: <FaUsers className="text-blue-500 text-xl" />,
            iconBg: 'bg-blue-100',
            buttonText: 'Manage Campaigns',
            onManage: () => navigate('/campaigner-campaign-management/campaigns'),
            onAdd: () => navigate('/campaigner-campaign-management/campaigns/create'),
        },
        {
            id: 5,
            title: 'Campaign Management',
            description: 'Manage main campaigns',
            icon: <FaBullhorn className="text-purple-500 text-xl" />,
            iconBg: 'bg-purple-100',
            buttonText: 'Manage Campaigns',
            onManage: () => navigate('/campaign-management/list'),
            onAdd: () => navigate('/campaign-management/create'),
        },
        {
            id: 6,
            title: 'Video Gallery',
            description: 'Manage event and campaign videos',
            icon: <FaVideo className="text-red-500 text-xl" />,
            iconBg: 'bg-red-100',
            buttonText: 'Manage Videos',
            onManage: () => navigate('/video-gallery'),
            onAdd: () => navigate('/video-gallery/create'),
        },
        {
            id: 7,
            title: 'Photo Gallery',
            description: 'Manage event and campaign photos',
            icon: <FaImages className="text-green-500 text-xl" />,
            iconBg: 'bg-green-100',
            buttonText: 'Manage Photos',
            onManage: () => navigate('/photo-gallery'),
            onAdd: () => navigate('/photo-gallery/create'),
        },
        {
            id: 8,
            title: 'Donor Wall',
            description: 'Manage donors and visibility settings',
            icon: <FaCrown className="text-orange-500 text-xl" />,
            iconBg: 'bg-orange-100',
            buttonText: 'Manage Donors',
            onManage: () => navigate('/donor-wall'),
            onAdd: () => navigate('/donor-wall/create'),
        },


    ];

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card) => (
                    <div key={card.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-start transition-shadow hover:shadow-md">
                        <div className={`p-3 rounded-lg ${card.iconBg} mb-4`}>
                            {card.icon}
                        </div>

                        <h3 className="text-xl font-bold text-gray-800 mb-2">{card.title}</h3>
                        <p className="text-gray-500 text-sm mb-6 flex-grow">{card.description}</p>

                        <div className="w-full flex items-center gap-3 mt-auto">
                            <button
                                onClick={card.onManage}
                                className="flex-grow bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
                            >
                                {card.buttonText}
                            </button>
                            <button
                                onClick={card.onAdd}
                                className="flex-shrink-0 w-10 h-10 flex items-center justify-center border border-orange-500 rounded-lg text-orange-500 hover:bg-orange-50 transition-colors"
                            >
                                <FaPlus />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DonationKitManagement;
