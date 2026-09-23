import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import http from 'http';

import { User } from '../src/models/user.model.js';
import { Item } from '../src/models/item.model.js';
import { Request } from '../src/models/request.model.js';
import { app } from '../src/app.js';
import { initializeSocket } from '../src/socket.js';

process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'secret123';
process.env.ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '1d';
process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh123';
process.env.REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '10d';

const PORT = process.env.TEST_PORT_CONCURRENCY || 8009;
const BASE_URL = `http://127.0.0.1:${PORT}/api/v1`;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sharenet';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }
  const reqOptions = {
    method: options.method || 'GET',
    headers
  };
  if (options.body) {
    reqOptions.body = JSON.stringify(options.body);
  }
  const res = await fetch(url, reqOptions);
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  return { status: res.status, data };
}

function generateToken(userId, collegeDomain = 'testcollege.edu') {
  return jwt.sign(
    { _id: userId.toString(), collegeDomain, email: `user_${userId}@testcollege.edu` },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1d' }
  );
}

async function runConcurrencyTests() {
  console.log('===============================================================');
  console.log('       SHARENET ATOMIC CONCURRENCY & INVARIANT VERIFICATION    ');
  console.log('===============================================================');

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB at:', MONGODB_URI);

  const server = http.createServer(app);
  initializeSocket(server);
  await new Promise(resolve => server.listen(PORT, '127.0.0.1', resolve));
  console.log(`Test API server running on port ${PORT}\n`);

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} | ${details}`);
      failed++;
    }
  }

  try {
    // Clean up test collections
    await User.deleteMany({ email: /@concurrency-test\.edu$/ });
    await Item.deleteMany({ title: /Concurrency Test/ });
    await Request.deleteMany({ description: /Instant claim for free item/ });

    // Create item owner
    const owner = await User.create({
      fullName: 'Item Owner',
      username: `owner_${Date.now()}`,
      email: `owner_${Date.now()}@concurrency-test.edu`,
      password: 'Password123!',
      college: 'Concurrency College',
      campus: 'Main Campus',
      collegeDomain: 'concurrency-test.edu',
      isVerified: true
    });
    const ownerToken = generateToken(owner._id, 'concurrency-test.edu');

    // -------------------------------------------------------------
    // TEST 1: 20 Concurrent Users Competing for EXACTLY 1 Available Slot
    // -------------------------------------------------------------
    console.log('\n--- TEST 1: 20 Concurrent Users Competing for 1 Slot ---');
    const singleSlotItem = await Item.create({
      title: 'Concurrency Test: Single Slot Item',
      description: 'Item with capacity maxClaimers = 1',
      category: 'Electronics',
      condition: 'GOOD',
      mode: 'GIVE',
      instantClaim: true,
      maxClaimers: 1,
      isAvailable: true,
      owner: owner._id,
      collegeDomain: 'concurrency-test.edu'
    });

    // Create 20 unique competitors
    const users20 = [];
    for (let i = 0; i < 20; i++) {
      const u = await User.create({
        fullName: `Competitor ${i}`,
        username: `competitor_${i}_${Date.now()}`,
        email: `competitor_${i}_${Date.now()}@concurrency-test.edu`,
        password: 'Password123!',
        college: 'Concurrency College',
        campus: 'Main Campus',
        collegeDomain: 'concurrency-test.edu',
        isVerified: true
      });
      users20.push({ user: u, token: generateToken(u._id, 'concurrency-test.edu') });
    }

    // Fire 20 requests concurrently in the same event tick
    const results1 = await Promise.all(
      users20.map(u => request(`/requests/instant-claim/${singleSlotItem._id}`, {
        method: 'POST',
        token: u.token
      }))
    );

    const success1 = results1.filter(r => r.status === 200);
    const rejected1 = results1.filter(r => r.status === 400);

    assert(success1.length === 1, 'Exactly 1 user succeeds out of 20 concurrent requests', `Got ${success1.length} successes`);
    assert(rejected1.length === 19, 'Exactly 19 users receive 400 Capacity/Check Rejection', `Got ${rejected1.length} rejected`);

    const dbItem1 = await Item.findById(singleSlotItem._id);
    assert(dbItem1.claimedBy.length === 1, 'MongoDB Item.claimedBy has exactly 1 element', `Found ${dbItem1.claimedBy.length}`);
    assert(dbItem1.isAvailable === false, 'Item isAvailable automatically flipped to false when capacity reached', `isAvailable is ${dbItem1.isAvailable}`);

    const dbRequests1 = await Request.find({ item: singleSlotItem._id });
    assert(dbRequests1.length === 1, 'MongoDB Request collection has exactly 1 request document (no orphaned claims)', `Found ${dbRequests1.length}`);

    // -------------------------------------------------------------
    // TEST 2: 20 Concurrent Users Competing for EXACTLY 3 Available Slots
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: 20 Concurrent Users Competing for 3 Slots ---');
    const threeSlotItem = await Item.create({
      title: 'Concurrency Test: Three Slot Item',
      description: 'Item with capacity maxClaimers = 3',
      category: 'Books',
      condition: 'GOOD',
      mode: 'GIVE',
      instantClaim: true,
      maxClaimers: 3,
      isAvailable: true,
      owner: owner._id,
      collegeDomain: 'concurrency-test.edu'
    });

    const results2 = await Promise.all(
      users20.map(u => request(`/requests/instant-claim/${threeSlotItem._id}`, {
        method: 'POST',
        token: u.token
      }))
    );

    const success2 = results2.filter(r => r.status === 200);
    const rejected2 = results2.filter(r => r.status === 400);

    assert(success2.length === 3, 'Exactly 3 users succeed out of 20 concurrent requests for 3 slots', `Got ${success2.length} successes`);
    assert(rejected2.length === 17, 'Exactly 17 users receive 400 Rejection', `Got ${rejected2.length} rejected`);

    const dbItem2 = await Item.findById(threeSlotItem._id);
    assert(dbItem2.claimedBy.length === 3, 'MongoDB Item.claimedBy has exactly 3 elements', `Found ${dbItem2.claimedBy.length}`);
    assert(dbItem2.isAvailable === false, 'Item isAvailable is false after 3/3 claims filled', `isAvailable is ${dbItem2.isAvailable}`);

    const dbRequests2 = await Request.find({ item: threeSlotItem._id });
    assert(dbRequests2.length === 3, 'MongoDB Request collection has exactly 3 request documents', `Found ${dbRequests2.length}`);

    // -------------------------------------------------------------
    // TEST 3: Same User Submitting Simultaneous Duplicate Requests
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: Same User Simultaneous Duplicate Claim Prevention ---');
    const multiSlotItem = await Item.create({
      title: 'Concurrency Test: Multi Slot Item',
      description: 'Capacity is 10, but user tries to claim multiple times concurrently',
      category: 'Other',
      condition: 'GOOD',
      mode: 'GIVE',
      instantClaim: true,
      maxClaimers: 10,
      isAvailable: true,
      owner: owner._id,
      collegeDomain: 'concurrency-test.edu'
    });

    const userX = users20[0];
    const duplicateRequests = await Promise.all([
      request(`/requests/instant-claim/${multiSlotItem._id}`, { method: 'POST', token: userX.token }),
      request(`/requests/instant-claim/${multiSlotItem._id}`, { method: 'POST', token: userX.token }),
      request(`/requests/instant-claim/${multiSlotItem._id}`, { method: 'POST', token: userX.token }),
      request(`/requests/instant-claim/${multiSlotItem._id}`, { method: 'POST', token: userX.token }),
      request(`/requests/instant-claim/${multiSlotItem._id}`, { method: 'POST', token: userX.token })
    ]);

    const dupSuccess = duplicateRequests.filter(r => r.status === 200);
    const dupRejected = duplicateRequests.filter(r => r.status === 400);

    assert(dupSuccess.length === 1, 'Exactly 1 request succeeds when same user sends 5 concurrent requests', `Got ${dupSuccess.length}`);
    assert(dupRejected.length === 4, 'Remaining 4 requests rejected with 400 (Already Claimed)', `Got ${dupRejected.length}`);

    const dbItem3 = await Item.findById(multiSlotItem._id);
    assert(dbItem3.claimedBy.length === 1, 'Item has only 1 claim entry for the user in database', `Found ${dbItem3.claimedBy.length}`);

    // -------------------------------------------------------------
    // TEST 4: Cancellation Correctly Restores Capacity & Availability
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: Claim Cancellation Restores Availability ---');
    const claimToCancel = dbItem1.claimedBy[0];
    const cancelRes = await request(`/requests/claims/${claimToCancel._id}/status`, {
      method: 'PATCH',
      token: ownerToken,
      body: { status: 'CANCELLED' }
    });
    assert(cancelRes.status === 200, 'Owner successfully marks claim as CANCELLED');

    const dbItem1AfterCancel = await Item.findById(singleSlotItem._id);
    assert(dbItem1AfterCancel.isAvailable === true, 'Item availability restored to true after claim cancellation', `isAvailable is ${dbItem1AfterCancel.isAvailable}`);

    // Another user can now claim the restored slot
    const competitor = users20[1];
    const reclaimRes = await request(`/requests/instant-claim/${singleSlotItem._id}`, {
      method: 'POST',
      token: competitor.token
    });
    assert(reclaimRes.status === 200, 'Restored slot successfully claimed by new user', `Status was ${reclaimRes.status}`);

    // -------------------------------------------------------------
    // TEST 5: Zod Runtime Validation Rejections at API Boundary
    // -------------------------------------------------------------
    console.log('\n--- TEST 5: Zod Boundary Runtime Validation ---');
    const invalidIdRes = await request(`/requests/instant-claim/not-a-valid-object-id`, {
      method: 'POST',
      token: userX.token
    });
    assert(invalidIdRes.status === 400, 'Zod rejects invalid MongoDB ObjectId parameter with 400');
    assert(invalidIdRes.data?.message?.includes('Validation Error'), 'Zod produces structured Validation Error message');

    const invalidBodyRes = await request('/requests', {
      method: 'POST',
      token: userX.token,
      body: { proposedPrice: -50 } // Missing item and negative price
    });
    assert(invalidBodyRes.status === 400, 'Zod rejects invalid body schema (negative price, missing item)');

  } catch (err) {
    console.error('Unexpected error during test execution:', err);
    failed++;
  } finally {
    console.log('\n===============================================================');
    console.log(`TOTAL CONCURRENCY TESTS: ${passed + failed}`);
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED: ${failed}`);
    console.log('===============================================================\n');

    server.close();
    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runConcurrencyTests();
