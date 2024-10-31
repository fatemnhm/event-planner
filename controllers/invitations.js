const express = require('express');
const router = express.Router();
const Event = require('../models/event');
const User = require('../models/user');

// GET invitations for the logged-in user
router.get('/', async (req, res) => {
    try {
      const userId = req.session.user._id;
  
      // Find all events where the user is an attendee
      const invitations = await Event.find({ 'attendees.user': userId })
        .populate('owner', 'username')
        .populate('attendees.user', 'username');
  
      // Render the invitations list
      res.render('invitations/index.ejs', { invitations, user: req.session.user });
    } catch (error) {
      console.error(error);
      res.redirect('/');
    }
  });


module.exports = router;
