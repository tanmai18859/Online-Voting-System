const express = require('express');
const router = express.Router();
const {
  castVote,
  getElectionResults,
  getVoteAuditLogs
} = require('../controllers/voteController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, castVote);
router.get('/audit', protect, authorize('admin'), getVoteAuditLogs);
router.get('/results/:electionId', protect, getElectionResults);
// Keep compatibility with both URL styles
router.get('/:electionId', protect, getElectionResults);

module.exports = router;
