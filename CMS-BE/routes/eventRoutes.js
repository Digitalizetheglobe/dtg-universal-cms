const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Get all events
router.get('/', eventController.getEvents);



// Get event by ID
router.get('/:id', eventController.getEventById);

// Get event by slug
router.get('/slug/:slug', eventController.getEventBySlug);

// Create new event
router.post('/', eventController.createEvent);

// Update event
router.put('/:id', eventController.updateEvent);

// Delete event
router.delete('/:id', eventController.deleteEvent);

module.exports = router;