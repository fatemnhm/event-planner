const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  dressCode: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  attendees: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: {
        type: String,
        enum: ['Invited', 'Accepted', 'Declined'],
        default: 'Invited',
      },
    },
  ],
});




const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
