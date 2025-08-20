import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const TestimonialManagement = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    rating: 5,
    testimonialText: '',
    date: new Date().toISOString().split('T')[0],
    companyName: '',
    otherFields: {
      position: ''
    }
  });

  // Fetch all testimonials
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/testimonials/');
        const data = await response.json();
        setTestimonials(data);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to fetch testimonials');
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name in formData.otherFields) {
      setFormData({
        ...formData,
        otherFields: {
          ...formData.otherFields,
          [name]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = currentTestimonial 
        ? `http://localhost:5000/api/testimonials/${currentTestimonial._id}`
        : 'http://localhost:5000/api/testimonials/';
      
      const method = currentTestimonial ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Operation failed');

      const data = await response.json();
      
      if (currentTestimonial) {
        setTestimonials(testimonials.map(t => t._id === data._id ? data : t));
        toast.success('Testimonial updated successfully');
      } else {
        setTestimonials([...testimonials, data]);
        toast.success('Testimonial added successfully');
      }

      setIsModalOpen(false);
      setCurrentTestimonial(null);
      resetForm();
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Edit testimonial
  const handleEdit = (testimonial) => {
    setCurrentTestimonial(testimonial);
    setFormData({
      fullName: testimonial.fullName,
      rating: testimonial.rating,
      testimonialText: testimonial.testimonialText,
      date: testimonial.date.split('T')[0],
      companyName: testimonial.companyName,
      otherFields: {
        position: testimonial.otherFields?.position || ''
      }
    });
    setIsModalOpen(true);
  };

  // Delete testimonial
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/testimonials/${id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Deletion failed');
        
        setTestimonials(testimonials.filter(t => t._id !== id));
        toast.success('Testimonial deleted successfully');
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      fullName: '',
      rating: 5,
      testimonialText: '',
      date: new Date().toISOString().split('T')[0],
      companyName: '',
      otherFields: {
        position: ''
      }
    });
  };

  // Open modal for new testimonial
  const openNewTestimonialModal = () => {
    setCurrentTestimonial(null);
    resetForm();
    setIsModalOpen(true);
  };

  // Render stars based on rating
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span
        key={i}
        className={`text-2xl ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900">Testimonial Management</h1>
        <button
          onClick={openNewTestimonialModal}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-6 rounded-lg shadow-lg transition duration-300 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Testimonial
        </button>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial._id}
            className="bg-gradient-to-br from-white to-gray-100 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{testimonial.fullName}</h3>
                  <p className="text-gray-600">{testimonial.otherFields?.position} at {testimonial.companyName}</p>
                </div>
                <div className="flex items-center">
                  {renderStars(testimonial.rating)}
                </div>
              </div>
              <p className="mt-4 text-gray-700 italic">"{testimonial.testimonialText}"</p>
              <div className="mt-6 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {new Date(testimonial.date).toLocaleDateString()}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(testimonial)}
                    className="text-blue-600 hover:text-blue-800 transition duration-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial._id)}
                    className="text-red-600 hover:text-red-800 transition duration-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fadeIn"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {currentTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 transition duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Form fields */}
                  {[
                    { label: 'Full Name', type: 'text', name: 'fullName', value: formData.fullName },
                    { label: 'Rating', type: 'select', name: 'rating', value: formData.rating, options: [1, 2, 3, 4, 5] },
                    { label: 'Testimonial Text', type: 'textarea', name: 'testimonialText', value: formData.testimonialText },
                    { label: 'Date', type: 'date', name: 'date', value: formData.date },
                    { label: 'Company Name', type: 'text', name: 'companyName', value: formData.companyName },
                    { label: 'Position', type: 'text', name: 'position', value: formData.otherFields.position }
                  ].map(({ label, type, name, value, options }, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                      {type === 'textarea' ? (
                        <textarea
                          name={name}
                          value={value}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        ></textarea>
                      ) : type === 'select' ? (
                        <select
                          name={name}
                          value={value}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          {options.map((option) => (
                            <option key={option} value={option}>
                              {option} Star{option !== 1 ? 's' : ''}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={type}
                          name={name}
                          value={value}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md hover:from-blue-600 hover:to-purple-700 transition duration-300"
                  >
                    {currentTestimonial ? 'Update' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialManagement;