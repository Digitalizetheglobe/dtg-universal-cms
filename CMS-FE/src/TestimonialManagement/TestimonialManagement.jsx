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
    photo: '',
    date: new Date().toISOString().split('T')[0],
    companyName: '',
    rating: 5,
    otherFields: {
      position: ''
    }
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Fetch all testimonials
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('https://api.harekrishnavidya.org/api/testimonials/');
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
    if (formData.otherFields && name in formData.otherFields) {
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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = currentTestimonial
        ? `https://api.harekrishnavidya.org/api/testimonials/${currentTestimonial._id}`
        : 'https://api.harekrishnavidya.org/api/testimonials/';

      const method = currentTestimonial ? 'PUT' : 'POST';

      const dataToSend = new FormData();
      dataToSend.append('fullName', formData.fullName);
      dataToSend.append('location', formData.location);
      dataToSend.append('testimonialText', formData.testimonialText);
      dataToSend.append('rating', formData.rating);
      dataToSend.append('date', formData.date);
      dataToSend.append('companyName', formData.companyName);
      dataToSend.append('otherFields', JSON.stringify(formData.otherFields));

      if (photoFile) {
        dataToSend.append('photo', photoFile);
      }

      const response = await fetch(url, {
        method,
        body: dataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Operation failed');
      }

      const result = await response.json();
      // Handle both direct object and { success: true, data: { ... } } formats
      const data = result.data || result;

      if (currentTestimonial) {
        setTestimonials(testimonials.map(t => (t._id === data._id || t._id === currentTestimonial._id) ? data : t));
        toast.success('Testimonial updated successfully');
      } else {
        setTestimonials([data, ...testimonials]);
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
      fullName: testimonial.fullName || '',
      location: testimonial.location || '',
      rating: testimonial.rating || 5,
      testimonialText: testimonial.testimonialText || '',
      photo: testimonial.photo || '',
      date: testimonial.date ? testimonial.date.split('T')[0] : new Date().toISOString().split('T')[0],
      companyName: testimonial.companyName || '',
      otherFields: {
        position: testimonial.otherFields?.position || ''
      }
    });
    setPhotoPreview(testimonial.photo ? `https://api.harekrishnavidya.org/uploads/testimonials/${testimonial.photo}` : null);
    setPhotoFile(null);
    setIsModalOpen(true);
  };

  // Delete testimonial
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      try {
        const response = await fetch(`https://api.harekrishnavidya.org/api/testimonials/${id}`, {
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
      location: '',
      testimonialText: '',
      photo: '',
      date: new Date().toISOString().split('T')[0],
      companyName: '',
      rating: 5,
      otherFields: {
        position: ''
      }
    });
    setPhotoFile(null);
    setPhotoPreview(null);
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
        className={`text-xl ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ★
      </span>
    ));
  };

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
                <div className="flex items-center space-x-4">
                  {testimonial.photo ? (
                    <img
                      src={`https://api.harekrishnavidya.org/uploads/testimonials/${testimonial.photo}`}
                      alt={testimonial.fullName}
                      className="w-14 h-14 rounded-full object-cover border-2 border-purple-500 shadow-md"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
                      {testimonial.fullName?.charAt(0) || '?'}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{testimonial.fullName}</h3>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {renderStars(testimonial.rating || 5)}
                </div>
              </div>
              <p className="mt-4 italic text-gray-700 min-h-[80px]">"{testimonial.testimonialText}"</p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
          <div
            className="w-full max-w-xl bg-white shadow-2xl rounded-2xl animate-fadeIn overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {currentTestimonial ? 'Edit Testimonial' : 'Create New Testimonial'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 max-h-[85vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Photo Upload Section */}
                  <div className="flex flex-col items-center pb-4 border-b border-gray-100">
                    <div className="relative mb-3 group">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl group-hover:brightness-90 transition-all"
                        />
                      ) : (
                        <div className="w-28 h-28 rounded-full bg-gray-50 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 group-hover:border-purple-400 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-[10px] font-bold">ADD PHOTO</span>
                        </div>
                      )}
                      <label
                        htmlFor="photo-upload"
                        className="absolute bottom-1 right-1 bg-purple-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-purple-700 hover:scale-110 active:scale-95 transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.103-1.103A1 1 0 0011.103 3H8.897a1 1 0 00-.707.293L7.087 4.407A1 1 0 016.38 4.7H4zm3 8a3 3 0 106 0 3 3 0 00-6 0z" clipRule="evenodd" />
                        </svg>
                      </label>
                      <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    </div>
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-sm"
                        placeholder="e.g. John Doe"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-sm"
                        placeholder="e.g. Mumbai, India"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Company / Org</label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-sm"
                        placeholder="e.g. Google"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rating</label>
                      <select
                        name="rating"
                        value={formData.rating}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-sm"
                        required
                      >
                        {[5, 4, 3, 2, 1].map(r => (
                          <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Testimonial Text</label>
                    <textarea
                      name="testimonialText"
                      value={formData.testimonialText}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-sm resize-none"
                      placeholder="Share the feedback here..."
                      required
                    ></textarea>
                  </div>
                </div>

                <div className="flex items-center justify-end mt-8 space-x-3 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-200 hover:shadow-purple-300 active:scale-95 transition-all text-sm"
                  >
                    {currentTestimonial ? 'Update Testimonial' : 'Create Testimonial'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Testimonial Photos Gallery Section */}
      {testimonials.some(t => t.photo) && (
        <div className="mt-16 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 002-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Testimonial Photos</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {testimonials.filter(t => t.photo).map((testimonial) => (
              <div
                key={testimonial._id}
                className="group relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => handleEdit(testimonial)}
              >
                <img
                  src={`https://api.harekrishnavidya.org/uploads/testimonials/${testimonial.photo}`}
                  alt={testimonial.fullName}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                  <p className="text-white text-xs font-bold truncate">{testimonial.fullName}</p>
                  <p className="text-white/80 text-[10px] truncate">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialManagement;