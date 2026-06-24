const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Election = require('./models/Election');
const Candidate = require('./models/Candidate');
const Vote = require('./models/Vote');

// Load environment variables
dotenv.config();

const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/online_voting';

async function runTest() {
  console.log('🧪 Starting database constraints integrity test...');
  console.log(`Connecting to: ${dbUri}`);

  try {
    await mongoose.connect(dbUri);
    console.log('✅ Connected to MongoDB.');

    // 1. Cleanup old test data
    console.log('🧹 Cleaning up old test data...');
    const testEmail = 'voter_test@decidesecure.org';
    await User.deleteMany({ email: testEmail });
    
    const testElectionTitle = 'Sandbox Test Election';
    const oldElection = await Election.findOne({ title: testElectionTitle });
    if (oldElection) {
      await Candidate.deleteMany({ electionId: oldElection._id });
      await Vote.deleteMany({ electionId: oldElection._id });
      await Election.deleteOne({ _id: oldElection._id });
    }

    // 2. Create test User
    console.log('👤 Creating sandbox voter...');
    const user = await User.create({
      name: 'Sandbox Voter',
      email: testEmail,
      password: 'password123',
      role: 'user'
    });
    console.log(`Voter created. ID: ${user._id}`);

    // 3. Create test Election
    console.log('🗳 Creating sandbox election...');
    const now = new Date();
    const startDate = new Date(now.getTime() - 1000 * 60 * 60); // 1 hour ago (Active)
    const endDate = new Date(now.getTime() + 1000 * 60 * 60 * 24); // 24 hours from now
    const election = await Election.create({
      title: testElectionTitle,
      description: 'Testing double-voting database-level prevention',
      startDate,
      endDate
    });
    console.log(`Election created. ID: ${election._id}, status: ${election.status}`);

    // 4. Create test Candidate
    console.log('👥 Creating sandbox candidates...');
    const candidateA = await Candidate.create({
      name: 'Candidate Alpha',
      party: 'Alpha Party',
      electionId: election._id
    });
    const candidateB = await Candidate.create({
      name: 'Candidate Beta',
      party: 'Beta Party',
      electionId: election._id
    });
    console.log(`Candidates registered. A: ${candidateA._id}, B: ${candidateB._id}`);

    // 5. Cast First Vote
    console.log('🗳 Casting first vote (Voter -> Alpha)...');
    const firstVote = await Vote.create({
      userId: user._id,
      electionId: election._id,
      candidateId: candidateA._id
    });
    console.log(`First vote recorded. ID: ${firstVote._id}`);

    // 6. Attempt Double Vote (Same Voter, Same Election, Different Candidate)
    console.log('🛑 Attempting to cast double vote (Voter -> Beta)...');
    try {
      await Vote.create({
        userId: user._id,
        electionId: election._id,
        candidateId: candidateB._id
      });
      
      console.error('❌ FAIL: Database allowed a double vote for the same election!');
      process.exit(1);
    } catch (error) {
      if (error.code === 11000) {
        console.log('✅ SUCCESS: Database successfully rejected the double vote with Duplicate Key Error (11000)!');
      } else {
        console.error('❌ FAIL: Database threw an unexpected error:', error.message);
        process.exit(1);
      }
    }

    // 7. Cleanup sandbox items
    console.log('🧹 Cleaning up sandbox data...');
    await User.deleteOne({ _id: user._id });
    await Candidate.deleteMany({ electionId: election._id });
    await Vote.deleteMany({ electionId: election._id });
    await Election.deleteOne({ _id: election._id });
    console.log('✅ Cleanup finished.');

    console.log('\n⭐ INTEGRITY CHECK PASSED: Double-voting prevention holds at the database constraints level! ⭐\n');
    process.exit(0);
  } catch (error) {
    console.error('💥 Test run encountered a fatal error:', error);
    process.exit(1);
  }
}

runTest();
