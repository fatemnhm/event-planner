const express = require('express');
const router = express.Router();

const Event = require('../models/event');
const User = require('../models/user'); 
const nodemailer = require('nodemailer');



let transporter = nodemailer.createTransport({
  service: 'gmail', // Example service
  auth: {
    user: 'eventplannergabh@gmail.com',
    pass: 'qwiwjlijerodccvs',
  },
});




router.get('/', async (req, res) => {
    try {
      const populatedEvents = await Event.find({}).populate('owner')
      console.log('events: ', populatedEvents)
      res.render('events/index.ejs', {
        event: populatedEvents})
    } catch (error) {
      console.log(error)
      res.redirect('/')
    } })
  router.get('/new', (req, res) => {
    res.render('events/new.ejs');
});


router.post('/', async (req, res) => {
    req.body.owner = req.session.user._id; // Set the owner of the event
    await Event.create(req.body);
    res.redirect('/events'); // Redirect to the events index
});

router.get('/:eventId', async (req, res) => {
    try {
      const event = await Event.findById(req.params.eventId)
        .populate('attendees.user', 'username') 
        .populate('owner', 'username'); 


  
      if (!event) {
        console.log('Event not found'); 
        return res.redirect('/'); 
      }
  
      res.render('events/show.ejs', { event, user: req.session.user }); 
    } catch (error) {
      console.log(error); 
      res.redirect('/'); 
    }
  });
  




  router.get('/:eventId/edit', async (req, res) => {
    try {
        const currentEvent = await Event.findById(req.params.eventId);
        res.render('events/edit.ejs', {
            event: currentEvent,
        });
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});


router.put('/:eventId', async (req, res) => {
    try {
        const currentEvent = await Event.findById(req.params.eventId);
        if (currentEvent.owner.equals(req.session.user._id)) {
            await currentEvent.updateOne(req.body);
            res.redirect('/events');
        } else {
            res.send("You don't have permission to do that.");
        }
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

router.delete('/:eventId', async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);
        if (event.owner.equals(req.session.user._id)) {
            await event.deleteOne();
            res.redirect('/events');
        } else {
            res.send("You don't have permission to do that.");
        }
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
});




router.post('/:eventId/attendees', async (req, res) => {
    try {
      const { username } = req.body; // get the username from the form input
      const user = await User.findOne({ username }); // Find user by username
  
      if (!user) {
        return res.send('User not found.'); //  doesn't exist
      }
  
      const event = await Event.findById(req.params.eventId);
  
      // already attendee
      const alreadyAttending = event.attendees.some(
        (attendee) => attendee.user.equals(user._id)
      );
  
      if (alreadyAttending) {
        return res.send('This user is already attending the event.');
      }
  
      // invite user
      event.attendees.push({ user: user._id });
      await event.save();
  
      // Configure mail options with event details 
      let mailOptions = {
        from: '"Events" <eventplannergabh@gmail.com>',
        to: user.email,
        subject: `Invitation to ${event.title}`,
        html: `
        <h1>🎉 You're Invited! 🎉</h1>
       <p><strong>📅 Event:</strong> ${event.title}</p>
      <p><strong>🗓️ Date:</strong> ${event.date}</p>
      <p><strong>⏰ Time:</strong> ${event.time}</p>
     <p><strong>📍 Location:</strong> ${event.location}</p>
      <p><strong>👗 Dress Code:</strong> ${event.dressCode}</p>
      <p><strong>📝 Description:</strong> ${event.description}</p>
       <p>🚀 Please visit the event page to accept the invitation!</p>

        `,
      };
  
      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
  
      // redirect 
      res.redirect(`/events/${req.params.eventId}`);
    } catch (error) {
      console.error(error);
      res.redirect(`/events/${req.params.eventId}`);
    }
  });
  

  router.post('/:eventId/status', async (req, res) => {
    try {
      const { status } = req.body;
      const event = await Event.findById(req.params.eventId);
  
      const attendee = event.attendees.find(att =>
        att.user._id.equals(req.session.user._id)
      );
  
      if (!attendee) {
        return res.status(403).send('You are not invited to this event.');
      }
  
      attendee.status = status;
      await event.save();
  
      res.redirect(`/events/${req.params.eventId}`);
    } catch (error) {
      console.error(error);
      res.redirect(`/events/${req.params.eventId}`);
    }
  });
  




module.exports = router;