const express = require('express');
const router = express.Router();
const {
  getCandidatesByElection,
  addCandidate,
  updateCandidate,
  deleteCandidate
} = require('../controllers/candidateController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('admin'), addCandidate);

router.route('/:id')
  .put(protect, authorize('admin'), updateCandidate)
  .delete(protect, authorize('admin'), deleteCandidate);

router.get('/election/:electionId', protect, getCandidatesByElection);
// Keep compatibility with both URL styles
router.get('/:electionId', protect, getCandidatesByElection);

module.exports = router;
