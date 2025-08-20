import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AnnouncementPreview = () => {
  const [announcements, setAnnouncements] = useState([]); // Initialize as empty array
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/announcements', {
          params: {
            isPublished: true,
            showOnFrontend: true,
            limit: 5
          }
        });
        
        // Handle different response structures
        const data = response.data;
        const announcementsData = Array.isArray(data) ? data : (data?.announcements || []);
        
        setAnnouncements(announcementsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching announcements:', err);
        setError('Failed to load announcements');
        setAnnouncements([]); // Ensure it's always an array
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  // Now it's safe to check announcements.length
  if (announcements.length === 0) {
    return (
      <div className="text-center py-8">
        <p>No announcements available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map((announcement) => (
        <div key={announcement._id} className="border rounded-lg p-4">
          {announcement.imageUrl && (
            <img 
              src={announcement.imageUrl} 
              alt={announcement.title} 
              className="w-full h-48 object-cover rounded mb-4"
            />
          )}
          <h3 className="text-xl font-semibold">{announcement.title}</h3>
          <p className="text-gray-600">{announcement.description}</p>
          <p className="text-sm text-gray-500 mt-2">
            {new Date(announcement.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default AnnouncementPreview;