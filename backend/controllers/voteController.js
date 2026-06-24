const Vote = require('../models/Vote');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const User = require('../models/User');

// @desc    Cast a vote
// @route   POST /api/vote
// @access  Private
const castVote = async (req, res) => {
  try {
    const { electionId, candidateId } = req.body;
    const userId = req.user._id;

    if (!electionId || !candidateId) {
      return res.status(400).json({ success: false, message: 'Please provide election ID and candidate ID' });
    }

    // 1. Verify election exists and is active
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    // Dynamic check of status
    const now = new Date();
    if (election.startDate > now) {
      return res.status(400).json({ success: false, message: 'Voting has not started yet for this election' });
    }
    if (election.endDate < now || election.status === 'ended') {
      return res.status(400).json({ success: false, message: 'This election has already ended' });
    }

    // 2. Verify candidate exists and belongs to this election
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    if (candidate.electionId.toString() !== electionId) {
      return res.status(400).json({ success: false, message: 'Candidate does not belong to this election' });
    }

    // 3. Double check in-memory user voted list (fast path)
    const user = await User.findById(userId);
    if (user.votedElections.includes(electionId)) {
      return res.status(400).json({ success: false, message: 'You have already voted in this election' });
    }

    // 4. Cast the vote by writing to Vote collection
    // Rely on compound unique index index { userId: 1, electionId: 1 } to prevent race-condition double voting
    let vote;
    try {
      vote = await Vote.create({
        userId,
        electionId,
        candidateId
      });
    } catch (dbError) {
      // Catch duplicate key error E11000
      if (dbError.code === 11000) {
        return res.status(400).json({ success: false, message: 'Duplicate vote detected. You have already voted in this election' });
      }
      throw dbError;
    }

    // 5. Increment Candidate vote count
    candidate.voteCount += 1;
    await candidate.save();

    // 6. Mark election as voted in User schema
    user.votedElections.push(electionId);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Vote cast successfully!',
      vote
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get results for an election
// @route   GET /api/results/:electionId
// @access  Protected
const getElectionResults = async (req, res) => {
  try {
    const { electionId } = req.params;

    // Verify election exists
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    // Fetch all candidates for this election
    const candidates = await Candidate.find({ electionId }).sort({ voteCount: -1 });
    
    // Sum total votes
    const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.voteCount, 0);

    // Calculate percentages and identify winner(s)
    let winner = null;
    if (totalVotes > 0) {
      // Since candidates are sorted by voteCount desc, index 0 has the highest vote
      const highestVotes = candidates[0].voteCount;
      // Handle potential ties by grabbing all candidates with the highest vote count
      const topCandidates = candidates.filter(c => c.voteCount === highestVotes);
      
      // If the election is ended, we declare the winner(s)
      winner = topCandidates;
    }

    // Get voting audit logs (only basic data to protect anonymity if needed, or details if admin)
    // We'll return candidate vote distributions and metadata
    res.json({
      success: true,
      election: {
        id: election._id,
        title: election.title,
        description: election.description,
        startDate: election.startDate,
        endDate: election.endDate,
        status: election.status
      },
      totalVotes,
      candidates: candidates.map(c => ({
        id: c._id,
        name: c.name,
        party: c.party,
        imageUrl: c.imageUrl,
        voteCount: c.voteCount,
        percentage: totalVotes > 0 ? parseFloat(((c.voteCount / totalVotes) * 100).toFixed(2)) : 0
      })),
      winner
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all votes audit log (Admin only)
// @route   GET /api/vote/audit
// @access  Private/Admin
const getVoteAuditLogs = async (req, res) => {
  try {
    const votes = await Vote.find({})
      .populate('userId', 'name email')
      .populate('electionId', 'title')
      .populate('candidateId', 'name party')
      .sort({ timestamp: -1 });

    res.json({ success: true, votes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  castVote,
  getElectionResults,
  getVoteAuditLogs
};
