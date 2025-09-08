import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const TestimonialManagement = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    location: '',
    testimonialText: '',
    
  });

  // Fetch all testimonials
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('https://dtg-universal-cms.onrender.com/api/testimonials/');
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
        ? `https://dtg-universal-cms.onrender.com/api/testimonials/${currentTestimonial._id}`
        : 'https://dtg-universal-cms.onrender.com/api/testimonials/';
      
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
        const response = await fetch(`https://dtg-universal-cms.onrender.com/api/testimonials/${id}`, {
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
  // const renderStars = (rating) => {
  //   return [...Array(5)].map((_, i) => (
  //     <span
  //       key={i}
  //       className={`text-2xl ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
  //     >
  //       ★
  //     </span>
  //   ));
  // };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900">Testimonial Management</h1>
        <button
          onClick={openNewTestimonialModal}
          className="flex items-center px-6 py-2 font-semibold text-white transition duration-300 rounded-lg shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Testimonial
        </button>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial._id}
            className="overflow-hidden transition-shadow duration-300 shadow-lg bg-gradient-to-br from-white to-gray-100 rounded-xl hover:shadow-2xl"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{testimonial.fullName}</h3>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
                {/* <div className="flex items-center">
                  {renderStars(testimonial.rating)}
                </div> */}
              </div>
              <p className="mt-4 italic text-gray-700">"{testimonial.testimonialText}"</p>
              <div className="flex items-center justify-between mt-6">
                <span className="text-sm text-gray-500">
                  {new Date(testimonial.date).toLocaleDateString()}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(testimonial)}
                    className="text-blue-600 transition duration-300 hover:text-blue-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial._id)}
                    className="text-red-600 transition duration-300 hover:text-red-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div
            className="w-full max-w-md bg-white shadow-2xl rounded-xl animate-fadeIn"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {currentTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 transition duration-300 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Form fields */}
                  {[
                    { label: 'Full Name', type: 'text', name: 'fullName', value: formData.fullName },
                    { label: 'Location', type: 'text', name: 'location', value: formData.location },
                    { label: 'Testimonial Text', type: 'textarea', name: 'testimonialText', value: formData.testimonialText },
                    
                  ].map(({ label, type, name, value, options }, index) => (
                    <div key={index}>
                      <label className="block mb-1 text-sm font-medium text-gray-700">{label}</label>
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
                <div className="flex justify-end mt-6 space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-700 transition duration-200 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white transition duration-300 rounded-md bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
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