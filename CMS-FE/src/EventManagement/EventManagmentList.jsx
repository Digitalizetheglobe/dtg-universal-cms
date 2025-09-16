import { useState, useEffect } from 'react';
import axios from 'axios';
import EventForm from './EventManagmentForm';
import { format } from 'date-fns';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const itemsPerPage = 8;

  useEffect(() => {
    fetchEvents();
  }, [currentPage, searchTerm]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/events', {
        params: { page: currentPage, limit: itemsPerPage, search: searchTerm }
      });

      const eventsData = Array.isArray(response.data)
        ? response.data
        : response.data?.events || [];

      setEvents(eventsData);
      setTotalPages(response.data?.totalPages || Math.ceil(eventsData.length / itemsPerPage) || 1);
      setError('');
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.response?.data?.message || 'Failed to fetch events');
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSuccess = (newEvent) => {
    setEvents((prev) => [newEvent, ...prev]);
    setShowForm(false);
  };

  const handleUpdateSuccess = (updatedEvent) => {
    setEvents((prev) =>
      prev.map((ev) => (ev._id === updatedEvent._id ? updatedEvent : ev))
    );
    setEditingEvent(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axios.delete(`http://localhost:5000/api/events/${id}`);
        setEvents((prev) => prev.filter((ev) => ev._id !== id));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete event');
      }
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col items-start justify-between mb-8 md:flex-row md:items-center">
        <h1 className="mb-4 text-3xl font-bold text-gray-800 md:mb-0">Events Management</h1>
        <button
          onClick={() => {
            setEditingEvent(null);
            setShowForm(true);
          }}
          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          + Create New Event
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 text-red-700 bg-red-100 border border-red-400 rounded">
          {error}
        </div>
      )}

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg md:w-1/3"
        />
      </div>

      {showForm && (
        <div className="mb-8">
          <EventForm
            event={editingEvent}
            onSuccess={editingEvent ? handleUpdateSuccess : handleCreateSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingEvent(null);
            }}
          />
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-lg shadow">
          <h3 className="mt-2 text-lg font-medium text-gray-900">No events found</h3>
          <p className="mt-1 text-gray-500">
            {searchTerm
              ? 'Try adjusting your search or filter.'
              : 'Start by creating a new event.'}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden bg-white shadow sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {events.map((event) => (
                <li key={event._id} className="p-4 hover:bg-gray-50">
                  <div className="flex flex-col md:flex-row md:items-center">
                    <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-4">
                      {event.uploadImage ? (
                        <img
                          src={event.uploadImage}
                          alt={event.title}
                          className="object-cover w-20 h-20 rounded-md"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-20 h-20 bg-gray-200 rounded-md">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 truncate">{event.title}</h3>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">{event.description}</p>
                      <div className="flex flex-wrap items-center mt-2 text-sm text-gray-500">
                        <div className="mr-4">
                          📅 {format(new Date(event.start), 'MMM dd, yyyy')} →{' '}
                          {format(new Date(event.end), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </div>
                    <div className="flex mt-4 space-x-2 md:mt-0">
                      <button
                        onClick={() => {
                          setEditingEvent(event);
                          setShowForm(true);
                        }}
                        className="px-3 py-1 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="px-3 py-1 text-sm font-medium text-red-600 border border-gray-300 rounded-md hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-6 space-x-2">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-3 py-1 rounded ${
                    currentPage === index + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EventList;
