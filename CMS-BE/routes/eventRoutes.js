const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Get all events
router.get('/', eventController.getEvents);

// Get events by country
router.get('/country/:country', eventController.getEventsByCountry);

// Get events by month
router.get('/month/:month', eventController.getEventsByMonth);

// Get event by ID
router.get('/:id', eventController.getEventById);

// Create new event
router.post('/', eventController.createEvent);

// Update event
router.put('/:id', eventController.updateEvent);

// Delete event
router.delete('/:id', eventController.deleteEvent);

module.exports = router;