const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');

// Utility function to sync and update election statuses based on current date
const syncElectionStatuses = async () => {
  const now = new Date();
  const elections = await Election.find({});
  for (let election of elections) {
    let newStatus = election.status;
    if (election.startDate > now) {
      newStatus = 'upcoming';
    } else if (election.endDate < now) {
      newStatus = 'ended';
    } else {
      newStatus = 'active';
    }
    if (election.status !== newStatus) {
      election.status = newStatus;
      await election.save();
    }
  }
};

// @desc    Get all elections
// @route   GET /api/elections
// @access  Public (or Protected)
const getElections = async (req, res) => {
  try {
    await syncElectionStatuses();
    const elections = await Election.find({}).sort({ startDate: 1 });
    res.json({ success: true, elections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single election details
// @route   GET /api/elections/:id
// @access  Protected
const getElectionById = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }
    res.json({ success: true, election });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new election
// @route   POST /api/elections
// @access  Private/Admin
const createElection = async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;

    if (!title || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Title, start date, and end date are required' });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ success: false, message: 'Start date must be before end date' });
    }

    const election = await Election.create({
      title,
      description,
      startDate,
      endDate
    });

    res.status(201).json({ success: true, election });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an election
// @route   PUT /api/elections/:id
// @access  Private/Admin
const updateElection = async (req, res) => {
  try {
    const { title, description, startDate, endDate, status } = req.body;
    const election = await Election.findById(req.params.id);

    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ success: false, message: 'Start date must be before end date' });
    }

    election.title = title || election.title;
    election.description = description || election.description;
    election.startDate = startDate || election.startDate;
    election.endDate = endDate || election.endDate;
    
    if (status) {
      election.status = status;
    } else {
      // Re-trigger pre-save status sync hook
      const now = new Date();
      if (election.startDate > now) {
        election.status = 'upcoming';
      } else if (election.endDate < now) {
        election.status = 'ended';
      } else {
        election.status = 'active';
      }
    }

    const updatedElection = await election.save();
    res.json({ success: true, election: updatedElection });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an election
// @route   DELETE /api/elections/:id
// @access  Private/Admin
const deleteElection = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    // Delete related candidates and votes to maintain data consistency
    await Candidate.deleteMany({ electionId: req.params.id });
    await Vote.deleteMany({ electionId: req.params.id });
    await election.deleteOne();

    res.json({ success: true, message: 'Election and all its candidates/votes deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getElections,
  getElectionById,
  createElection,
  updateElection,
  deleteElection
};
