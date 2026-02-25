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
        const response = await axios.get('https://api.harekrishnavidya.org/api/announcements', {
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
      <div className="flex items-center justify-center h-32">
        <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-3 text-red-700 bg-red-100 border border-red-400 rounded">
        {error}
      </div>
    );
  }

  // Now it's safe to check announcements.length
  if (announcements.length === 0) {
    return (
      <div className="py-8 text-center">
        <p>No announcements available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map((announcement) => (
        <div key={announcement._id} className="p-4 border rounded-lg">
          {announcement.imageUrl && (
            <img
              src={announcement.imageUrl}
              alt={announcement.title}
              className="object-cover w-full h-48 mb-4 rounded"
            />
          )}
          <h3 className="text-xl font-semibold">{announcement.title}</h3>
          <p className="text-gray-600">{announcement.description}</p>
          <p className="mt-2 text-sm text-gray-500">
            {new Date(announcement.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default AnnouncementPreview;