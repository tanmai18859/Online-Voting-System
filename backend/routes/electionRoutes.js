const express = require('express');
const router = express.Router();
const {
  getElections,
  getElectionById,
  createElection,
  updateElection,
  deleteElection
} = require('../controllers/electionController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getElections)
  .post(protect, authorize('admin'), createElection);

router.route('/:id')
  .get(protect, getElectionById)
  .put(protect, authorize('admin'), updateElection)
  .delete(protect, authorize('admin'), deleteElection);

module.exports = router;
