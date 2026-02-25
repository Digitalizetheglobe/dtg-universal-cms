import { useState, useEffect } from 'react';
import axios from 'axios';

const EventForm = ({ event, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    start: '',
    end: '',
    description: '',
    slug: '',
    uploadImage: null,
    coverImage1: null,
    coverImage2: null
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [previewCover1, setPreviewCover1] = useState(null);
  const [previewCover2, setPreviewCover2] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        start: event.start ? new Date(event.start).toISOString().slice(0, 10) : '',
        end: event.end ? new Date(event.end).toISOString().slice(0, 10) : '',
        description: event.description || '',
        slug: event.slug || '',
        uploadImage: null,
        coverImage1: null,
        coverImage2: null
      });
      if (event.uploadImage) setPreviewImage(event.uploadImage);
      if (event.coverImage1) setPreviewCover1(event.coverImage1);
      if (event.coverImage2) setPreviewCover2(event.coverImage2);
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fieldName, previewSetter) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, [fieldName]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        previewSetter(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const dataToSend = new FormData();
      dataToSend.append('title', formData.title);
      dataToSend.append('start', formData.start);
      dataToSend.append('end', formData.end);
      dataToSend.append('description', formData.description);
      dataToSend.append('slug', formData.slug);

      if (formData.uploadImage) dataToSend.append('image', formData.uploadImage);
      if (formData.coverImage1) dataToSend.append('coverImage1', formData.coverImage1);
      if (formData.coverImage2) dataToSend.append('coverImage2', formData.coverImage2);

      let response;
      if (event) {
        response = await axios.put(
          `https://api.harekrishnavidya.org/api/events/${event._id}`,
          dataToSend,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      } else {
        response = await axios.post(
          'https://api.harekrishnavidya.org/api/events',
          dataToSend,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      }

      onSuccess(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="max-w-3xl p-6 mx-auto bg-white rounded-lg shadow-xl">
      <h2 className="mb-6 text-2xl font-bold text-gray-800">
        {event ? 'Edit Event' : 'Create New Event'}
      </h2>

      {error && (
        <div className="p-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700" htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
          <div>
            <label className="block mb-2 font-medium text-gray-700" htmlFor="start">Start Date *</label>
            <input
              type="date"
              id="start"
              name="start"
              value={formData.start}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-700" htmlFor="end">End Date *</label>
            <input
              type="date"
              id="end"
              name="end"
              value={formData.end}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700" htmlFor="slug">Slug *</label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700" htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700">Event Image *</label>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'uploadImage', setPreviewImage)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {previewImage && (
              <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-md">
                <img src={previewImage} alt="Main Preview" className="object-cover w-full h-full" />
              </div>
            )}
          </div>
        </div>

        {/* Cover Image 1 */}
        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700">Cover Image 1</label>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'coverImage1', setPreviewCover1)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            {previewCover1 && (
              <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-md">
                <img src={previewCover1} alt="Cover 1 Preview" className="object-cover w-full h-full" />
              </div>
            )}
          </div>
        </div>

        {/* Cover Image 2 */}
        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700">Cover Image 2</label>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'coverImage2', setPreviewCover2)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
            />
            {previewCover2 && (
              <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-md">
                <img src={previewCover2} alt="Cover 2 Preview" className="object-cover w-full h-full" />
              </div>
            )}
          </div>
        </div>

        {/* Submit / Cancel */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <svg className="inline w-4 h-4 mr-2 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {event ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              event ? 'Update Event' : 'Create Event'
            )}
          </button>
        </div>


      </form>
    </div>
  );
};

export default EventForm;
