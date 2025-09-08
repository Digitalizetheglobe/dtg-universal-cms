import { useState, useEffect } from 'react';
import axios from 'axios';

const AnnouncementForm = ({ announcement, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    departments: [],
    isPublished: false,
    showOnFrontend: false,
    announcementImage: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const departmentOptions = ['HR', 'Finance', 'IT', 'Marketing', 'Operations', 'All'];

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title,
        content: announcement.content,
        departments: announcement.departments,
        isPublished: announcement.isPublished,
        showOnFrontend: announcement.showOnFrontend,
        announcementImage: null
      });
      if (announcement.imageUrl) {
        setPreviewImage(announcement.imageUrl);
      }
    }
  }, [announcement]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDepartmentChange = (dept) => {
    setFormData(prev => {
      const newDepartments = prev.departments.includes(dept)
        ? prev.departments.filter(d => d !== dept)
        : [...prev.departments, dept];
      return { ...prev, departments: newDepartments };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, announcementImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formData.departments.forEach(dept => formDataToSend.append('departments', dept));
      formDataToSend.append('isPublished', formData.isPublished);
      formDataToSend.append('showOnFrontend', formData.showOnFrontend);
      if (formData.announcementImage) {
        formDataToSend.append('announcementImage', formData.announcementImage);
      }

      let response;
      if (announcement) {
        response = await axios.put(`https://dtg-universal-cms.onrender.com/api/announcements/${announcement._id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        response = await axios.post('https://dtg-universal-cms.onrender.com/api/announcements', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      onSuccess(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl p-6 mx-auto bg-white rounded-lg shadow-xl">
      <h2 className="mb-6 text-2xl font-bold text-gray-800">
        {announcement ? 'Edit Announcement' : 'Create New Announcement'}
      </h2>
      
      {error && (
        <div className="p-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700" htmlFor="title">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700" htmlFor="content">
            Content *
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows="5"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700">
            Departments *
          </label>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {departmentOptions.map(dept => (
              <div key={dept} className="flex items-center">
                <input
                  type="checkbox"
                  id={`dept-${dept}`}
                  checked={formData.departments.includes(dept)}
                  onChange={() => handleDepartmentChange(dept)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor={`dept-${dept}`} className="ml-2 text-gray-700">
                  {dept}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700">
            Image
          </label>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="file"
                id="announcementImage"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-1 text-sm text-gray-500">PNG, JPG, JPEG up to 5MB</p>
            </div>
            {previewImage && (
              <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-md">
                <img src={previewImage} alt="Preview" className="object-cover w-full h-full" />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublished"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isPublished" className="ml-2 text-gray-700">
              Publish Immediately
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showOnFrontend"
              name="showOnFrontend"
              checked={formData.showOnFrontend}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="showOnFrontend" className="ml-2 text-gray-700">
              Show on Frontend
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="inline w-4 h-4 mr-2 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {announcement ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              announcement ? 'Update Announcement' : 'Create Announcement'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AnnouncementForm;