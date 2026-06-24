const Candidate = require('../models/Candidate');
const Election = require('../models/Election');

// @desc    Get candidates by election ID
// @route   GET /api/candidates/:electionId
// @access  Protected
const getCandidatesByElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    
    // Optional check to verify election exists
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    const candidates = await Candidate.find({ electionId });
    res.json({ success: true, candidates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a candidate to an election
// @route   POST /api/candidates
// @access  Private/Admin
const addCandidate = async (req, res) => {
  try {
    const { name, party, imageUrl, electionId } = req.body;

    if (!name || !party || !electionId) {
      return res.status(400).json({ success: false, message: 'Please provide candidate name, party, and election ID' });
    }

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Associated election not found' });
    }

    const candidate = await Candidate.create({
      name,
      party,
      imageUrl: imageUrl || '',
      electionId
    });

    res.status(201).json({ success: true, candidate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update candidate details
// @route   PUT /api/candidates/:id
// @access  Private/Admin
const updateCandidate = async (req, res) => {
  try {
    const { name, party, imageUrl } = req.body;
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    candidate.name = name || candidate.name;
    candidate.party = party || candidate.party;
    candidate.imageUrl = imageUrl !== undefined ? imageUrl : candidate.imageUrl;

    const updatedCandidate = await candidate.save();
    res.json({ success: true, candidate: updatedCandidate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a candidate
// @route   DELETE /api/candidates/:id
// @access  Private/Admin
const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    await candidate.deleteOne();
    res.json({ success: true, message: 'Candidate removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCandidatesByElection,
  addCandidate,
  updateCandidate,
  deleteCandidate
};
