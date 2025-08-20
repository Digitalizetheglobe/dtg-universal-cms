const Event = require('../models/Event');

// Get all events
// GET /api/events
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single event by ID
// GET /api/events/:id
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new event
// POST /api/events
exports.createEvent = async (req, res) => {
  try {
    const { month, date, country, eventExpo, venue } = req.body;

    // Validate required fields
    if (!month || !date || !country || !eventExpo || !venue) {
      return res.status(400).json({ 
        message: 'All fields are required: month, date, country, eventExpo, venue' 
      });
    }

    const newEvent = new Event({
      month,
      date,
      country,
      eventExpo,
      venue
    });

    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create event', error: error.message });
  }
};

// Update event
// PUT /api/events/:id
exports.updateEvent = async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id, 
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update event', error: error.message });
  }
};

// Delete event
// DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    
    if (!deletedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get events by country
// GET /api/events/country/:country
exports.getEventsByCountry = async (req, res) => {
  try {
    const events = await Event.find({ 
      country: { $regex: req.params.country, $options: 'i' } 
    }).sort({ createdAt: -1 });
    
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get events by month
// GET /api/events/month/:month
exports.getEventsByMonth = async (req, res) => {
  try {
    const events = await Event.find({ 
      month: { $regex: req.params.month, $options: 'i' } 
    }).sort({ createdAt: -1 });
    
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};