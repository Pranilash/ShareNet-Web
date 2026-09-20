import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import http from 'http';

// Load models
import { User } from './src/models/user.model.js';
import { Item } from './src/models/item.model.js';
import { Request } from './src/models/request.model.js';
import { Transaction } from './src/models/transaction.model.js';
import { Notification } from './src/models/notification.model.js';
import { Message } from './src/models/message.model.js';
import { LostFound } from './src/models/lostFound.model.js';
import { LostFoundClaim } from './src/models/lostFoundClaim.model.js';
import { ClaimChat, ClaimMessage } from './src/models/claimChat.model.js';
import { WantedItem } from './src/models/wantedItem.model.js';
import { OfferChat } from './src/models/offerChat.model.js';

import { app } from './src/app.js';
import { initializeSocket } from './src/socket.js';

process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'secret123';
process.env.ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '1d';
process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh123';
process.env.REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '10d';

const PORT = process.env.TEST_PORT || 8008;
const BASE_URL = `http://127.0.0.1:${PORT}/api/v1`;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sharenet';

const results = [];

function recordResult(module, method, endpoint, expectedStatus, actualStatus, statusMessage, data = null, isBug = false) {
  const passed = actualStatus === expectedStatus;
  const result = {
    module,
    method,
    endpoint,
    expectedStatus,
    actualStatus,
    passed,
    isBug: isBug || (!passed),
    statusMessage
  };
  results.push(result);
  const icon = result.passed && !result.isBug ? 'PASS' : 'FAIL';
  console.log(`[${icon}] ${method.padEnd(6)} ${endpoint.padEnd(58)} -> ${actualStatus} (Expected: ${expectedStatus}) | ${statusMessage}`);
}

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

async function runTestSuite() {
  console.log('Connecting to MongoDB for test suite at:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log('MongoDB connected successfully.');

  const server = http.createServer(app);
  initializeSocket(server);
  await new Promise(resolve => server.listen(PORT, '127.0.0.1', resolve));
  console.log(`Test API server running on port ${PORT}\n`);

  try {
    // Setup test users
    await User.deleteMany({ email: /@testcollege\.edu$/ });
    const userA = await User.create({
      fullName: 'Alice Test',
      username: 'alicetest_' + Date.now(),
      email: `alice_${Date.now()}@testcollege.edu`,
      password: 'Password123!',
      campus: 'North Campus',
      college: 'Test College',
      collegeDomain: 'testcollege.edu',
      isVerified: true,
      trustScore: 82
    });

    const userB = await User.create({
      fullName: 'Bob Test',
      username: 'bobtest_' + Date.now(),
      email: `bob_${Date.now()}@testcollege.edu`,
      password: 'Password123!',
      campus: 'North Campus',
      college: 'Test College',
      collegeDomain: 'testcollege.edu',
      isVerified: true,
      trustScore: 82
    });

    const tokenA = jwt.sign({ _id: userA._id }, process.env.ACCESS_TOKEN_SECRET || 'secret123', { expiresIn: '1d' });
    const refreshTokenA = jwt.sign({ _id: userA._id }, process.env.REFRESH_TOKEN_SECRET || 'refresh123', { expiresIn: '7d' });
    const tokenB = jwt.sign({ _id: userB._id }, process.env.ACCESS_TOKEN_SECRET || 'secret123', { expiresIn: '1d' });

    console.log('--- EXECUTING API TEST SUITE ACROSS ALL 55 ENDPOINTS ---\n');

    // 1. MODULE 1: AUTH & USERS (/api/v1/users)
    let res = await request('/users/colleges');
    recordResult('Users', 'GET', '/users/colleges', 200, res.status, 'Fetch supported colleges');

    res = await request('/users/current-user');
    recordResult('Users', 'GET', '/users/current-user (No Token)', 401, res.status, 'Auth middleware correctly rejects unauthenticated request with 401');

    res = await request('/users/current-user', { token: tokenA });
    recordResult('Users', 'GET', '/users/current-user (Valid Token)', 200, res.status, 'Fetch current user profile with valid JWT');

    res = await request(`/users/profile/${userA._id}`, { token: tokenB });
    recordResult('Users', 'GET', '/users/profile/:userId', 200, res.status, 'Fetch public user profile');

    res = await request('/users/login', {
      method: 'POST',
      body: { email: userA.email, password: 'WrongPassword' }
    });
    recordResult('Users', 'POST', '/users/login (Wrong Password)', 400, res.status, 'Reject invalid password');

    res = await request('/users/login', {
      method: 'POST',
      body: { email: userA.email, password: 'Password123!' }
    });
    recordResult('Users', 'POST', '/users/login (Valid)', 200, res.status, 'Login and issue tokens');

    userA.refreshToken = refreshTokenA;
    await userA.save({ validateBeforeSave: false });
    res = await request('/users/refresh-token', {
      method: 'POST',
      body: { refreshToken: refreshTokenA }
    });
    recordResult('Users', 'POST', '/users/refresh-token', 200, res.status, 'Refresh access token');

    // 2. MODULE 2: ITEMS (/api/v1/items)
    res = await request('/items');
    recordResult('Items', 'GET', '/items (Public Browsing)', 200, res.status, 'Public browsing permitted for guests');

    res = await request('/items', { token: tokenA });
    recordResult('Items', 'GET', '/items (Authenticated)', 200, res.status, 'Fetch filtered items for campus');

    res = await request('/items', {
      method: 'POST',
      token: tokenA,
      body: {
        title: 'TI-84 Graphing Calculator',
        description: 'Perfect for calculus and stats',
        category: 'Electronics',
        mode: 'RENT',
        price: 5,
        condition: 'GOOD',
        isAvailable: true
      }
    });
    const rentItem = res.data?.data;
    recordResult('Items', 'POST', '/items (Create RENT Item)', 201, res.status, 'Create rental item');

    res = await request('/items', {
      method: 'POST',
      token: tokenA,
      body: {
        title: 'Desk Lamp',
        description: 'Free desk lamp moving out',
        category: 'Furniture',
        mode: 'GIVE',
        price: 0,
        condition: 'GOOD',
        isAvailable: true,
        instantClaim: true
      }
    });
    const giveItem = res.data?.data;
    recordResult('Items', 'POST', '/items (Create GIVE Item)', 201, res.status, 'Create giveaway item');

    if (rentItem) {
      res = await request(`/items/${rentItem._id}`, { token: tokenB });
      recordResult('Items', 'GET', '/items/:itemId', 200, res.status, 'Fetch single item details');
    }

    res = await request('/items/my-items', { token: tokenA });
    recordResult('Items', 'GET', '/items/my-items', 200, res.status, 'Fetch authenticated user listings');

    if (rentItem) {
      res = await request(`/items/${rentItem._id}/availability`, {
        method: 'PATCH',
        token: tokenA
      });
      recordResult('Items', 'PATCH', '/items/:itemId/availability', 200, res.status, 'Toggle item availability');
      await request(`/items/${rentItem._id}/availability`, { method: 'PATCH', token: tokenA });
    }

    // 3. MODULE 3: REQUESTS & NEGOTIATION (/api/v1/requests)
    res = await request('/requests', {
      method: 'POST',
      token: tokenB,
      body: {
        item: rentItem?._id,
        description: 'Need it for midterm exams next week',
        proposedPrice: 4,
        rentalDays: 7
      }
    });
    const rentalReq = res.data?.data;
    recordResult('Requests', 'POST', '/requests', 201, res.status, 'Submit rental request');

    res = await request('/requests/my-requests', { token: tokenB });
    recordResult('Requests', 'GET', '/requests/my-requests', 200, res.status, 'Fetch sent requests');

    res = await request('/requests/received', { token: tokenA });
    recordResult('Requests', 'GET', '/requests/received', 200, res.status, 'Fetch received requests for owner');

    if (rentalReq) {
      res = await request(`/requests/${rentalReq._id}/counter-offer`, {
        method: 'POST',
        token: tokenA,
        body: {
          price: 4.5,
          duration: 7,
          message: 'Can do $4.50 for 7 days'
        }
      });
      recordResult('Requests', 'POST', '/requests/:requestId/counter-offer', 200, res.status, 'Owner creates counter-offer');

      const feRes = await request(`/requests/${rentalReq._id}/counter-offer/respond`, {
        method: 'POST',
        token: tokenB,
        body: { accept: true }
      });
      recordResult('Requests', 'POST', '/requests/:requestId/counter-offer/respond (Frontend Call)', 
        200, feRes.status, 'Counter offer accepted via frontend POST alias');

      const reqForPatch = await Request.create({
        requester: userB._id,
        owner: userA._id,
        item: rentItem._id,
        description: 'Request to test PATCH respond',
        status: 'COUNTER_OFFERED',
        counterOffer: { price: 5, duration: 5, status: 'PENDING' }
      });
      res = await request(`/requests/${reqForPatch._id}/counter-offer/respond`, {
        method: 'PATCH',
        token: tokenB,
        body: { accept: true }
      });
      recordResult('Requests', 'PATCH', '/requests/:requestId/counter-offer/respond (Backend Route)', 
        200, res.status, 'Counter offer accepted via PATCH');

      const fePickup = await request(`/requests/${rentalReq._id}/pickup`, {
        method: 'POST',
        token: tokenA,
        body: { location: 'Library 2nd Floor', proposedTime: new Date(Date.now() + 86400000).toISOString(), instructions: 'Ring when outside' }
      });
      recordResult('Requests', 'POST', '/requests/:requestId/pickup (Frontend Call)',
        200, fePickup.status, 'Propose pickup via /pickup alias');

      res = await request(`/requests/${rentalReq._id}/pickup-details`, {
        method: 'POST',
        token: tokenA,
        body: { location: 'Library 2nd Floor', proposedTime: new Date(Date.now() + 86400000).toISOString(), instructions: 'Ring when outside' }
      });
      recordResult('Requests', 'POST', '/requests/:requestId/pickup-details (Backend Route)',
        200, res.status, 'Propose pickup via /pickup-details');

      const feConfirmPickup = await request(`/requests/${rentalReq._id}/pickup/confirm`, {
        method: 'POST',
        token: tokenB
      });
      recordResult('Requests', 'POST', '/requests/:requestId/pickup/confirm (Frontend Call)',
        200, feConfirmPickup.status, 'Confirm pickup via /pickup/confirm alias');

      res = await request(`/requests/${rentalReq._id}/confirm-pickup-details`, {
        method: 'PATCH',
        token: tokenB
      });
      recordResult('Requests', 'PATCH', '/requests/:requestId/confirm-pickup-details (Backend Route)',
        200, res.status, 'Confirm pickup via /confirm-pickup-details');

      const itemDoc = await Item.findById(giveItem._id);
      itemDoc.claimedBy.push({
        user: userB._id,
        claimedAt: new Date(),
        status: 'PENDING_PICKUP'
      });
      await itemDoc.save();
      const testClaimId = itemDoc.claimedBy[0]._id;

      const feClaimStatus = await request(`/requests/claims/${testClaimId}/status`, {
        method: 'PATCH',
        token: tokenA,
        body: { status: 'COMPLETED' }
      });
      recordResult('Requests', 'PATCH', '/requests/claims/:claimId/status (Frontend Call)',
        200, feClaimStatus.status, 'Update claim status via frontend endpoint');
    }

    // 4. MODULE 4: TRANSACTIONS (/api/v1/transactions)
    const reqTx = await Request.create({
      requester: userB._id,
      owner: userA._id,
      item: rentItem?._id,
      description: 'Transaction test rental request',
      proposedPrice: 5,
      status: 'PENDING'
    });

    const acceptRes = await request(`/requests/${reqTx._id}/accept`, {
      method: 'POST',
      token: tokenA
    });
    const testTx = acceptRes.data?.data?.transaction;
    recordResult('Requests', 'POST', '/requests/:requestId/accept', 200, acceptRes.status, 'Owner accepts request and initiates transaction');

    res = await request('/transactions', { token: tokenB });
    recordResult('Transactions', 'GET', '/transactions', 200, res.status, 'Fetch user transactions');

    if (testTx) {
      res = await request(`/transactions/${testTx._id}`, { token: tokenB });
      recordResult('Transactions', 'GET', '/transactions/:transactionId', 200, res.status, 'Fetch single transaction detail');

      res = await request(`/transactions/${testTx._id}/propose-agreement`, {
        method: 'POST',
        token: tokenA,
        body: {
          terms: 'Standard campus return terms',
          returnDate: new Date(Date.now() + 7 * 86400000).toISOString(),
          conditionOnPickup: 'GOOD'
        }
      });
      recordResult('Transactions', 'POST', '/transactions/:transactionId/propose-agreement', 200, res.status, 'Owner proposes handover agreement');

      res = await request(`/transactions/${testTx._id}/confirm-agreement`, {
        method: 'POST',
        token: tokenB
      });
      recordResult('Transactions', 'POST', '/transactions/:transactionId/confirm-agreement', 200, res.status, 'Requester confirms agreement, activating transaction');

      // 5. MODULE 5: MESSAGES (Tested while transaction is ACTIVE)
      res = await request(`/messages/${testTx._id}`, {
        method: 'POST',
        token: tokenA,
        body: { content: 'Where should we meet on campus?' }
      });
      recordResult('Messages', 'POST', '/messages/:transactionId', 201, res.status, 'Send transaction chat message');

      res = await request(`/messages/${testTx._id}`, { token: tokenB });
      recordResult('Messages', 'GET', '/messages/:transactionId', 200, res.status, 'Fetch transaction message history');

      res = await request(`/transactions/${testTx._id}/mark-returned`, {
        method: 'POST',
        token: tokenB
      });
      recordResult('Transactions', 'POST', '/transactions/:transactionId/mark-returned', 200, res.status, 'Requester marks item as returned (RETURN_PENDING)');

      res = await request(`/transactions/${testTx._id}/confirm-return`, {
        method: 'POST',
        token: tokenA,
        body: { conditionOnReturn: 'GOOD' }
      });
      recordResult('Transactions', 'POST', '/transactions/:transactionId/confirm-return', 200, res.status, 'Owner confirms return and closes transaction');

      const txDispute = await Transaction.create({
        item: rentItem._id,
        request: reqTx._id,
        owner: userA._id,
        requester: userB._id,
        status: 'ACTIVE'
      });
      
      const scoreBeforeA = (await User.findById(userA._id)).trustScore;
      const scoreBeforeB = (await User.findById(userB._id)).trustScore;

      res = await request(`/transactions/${txDispute._id}/dispute`, {
        method: 'POST',
        token: tokenB,
        body: { reason: 'Item was damaged upon receipt' }
      });

      const scoreAfterA = (await User.findById(userA._id)).trustScore;
      const scoreAfterB = (await User.findById(userB._id)).trustScore;

      const disputeFixed = scoreAfterA === (scoreBeforeA - 10) && scoreAfterB === scoreBeforeB;
      recordResult('Transactions', 'POST', '/transactions/:transactionId/dispute',
        200, res.status,
        disputeFixed 
          ? `Dispute penalty correctly applied to reported user A (${scoreBeforeA} -> ${scoreAfterA}), reporter B untouched (${scoreAfterB})`
          : `INVERTED TRUST PENALTY: User A: ${scoreBeforeA}->${scoreAfterA}, User B: ${scoreBeforeB}->${scoreAfterB}`,
        null, !disputeFixed);
    }

    // 6. MODULE 6: NOTIFICATIONS (/api/v1/notifications)
    res = await request('/notifications', { token: tokenA });
    recordResult('Notifications', 'GET', '/notifications', 200, res.status, 'Fetch notifications list');

    res = await request('/notifications/unread-count', { token: tokenA });
    recordResult('Notifications', 'GET', '/notifications/unread-count', 200, res.status, 'Fetch unread notification count');

    res = await request('/notifications/read-all', {
      method: 'PATCH',
      token: tokenA
    });
    recordResult('Notifications', 'PATCH', '/notifications/read-all', 200, res.status, 'Mark all notifications read');

    // 7. MODULE 7: LOST & FOUND (/api/v1/lost-found)
    res = await request('/lost-found', {
      method: 'POST',
      token: tokenA,
      body: {
        title: 'Blue Hydroflask Bottle',
        description: 'Found in Main Aud Block B',
        type: 'FOUND',
        category: 'Accessories',
        location: 'Auditorium Block B',
        verificationQuestions: JSON.stringify([
          { question: 'What stickers are on the back?', answer: 'GitHub and React stickers' }
        ])
      }
    });
    const lfPost = res.data?.data;
    recordResult('LostFound', 'POST', '/lost-found', 201, res.status, 'Create lost/found report');

    res = await request('/lost-found', { token: tokenB });
    recordResult('LostFound', 'GET', '/lost-found', 200, res.status, 'Fetch campus lost/found notices');

    if (lfPost) {
      res = await request(`/lost-found/${lfPost._id}`, { token: tokenB });
      recordResult('LostFound', 'GET', '/lost-found/:postId', 200, res.status, 'Fetch single notice detail');

      res = await request(`/lost-found/${lfPost._id}/claim`, {
        method: 'POST',
        token: tokenB,
        body: {
          claimType: 'ITS_MINE',
          message: 'I left my bottle there yesterday afternoon'
        }
      });
      const claim = res.data?.data;
      recordResult('LostFound', 'POST', '/lost-found/:postId/claim', 201, res.status, 'Submit claim on notice');

      if (claim) {
        res = await request(`/lost-found/claims/${claim._id}/start-verification`, {
          method: 'PATCH',
          token: tokenA
        });
        recordResult('LostFound', 'PATCH', '/lost-found/claims/:claimId/start-verification', 200, res.status, 'Finder triggers anti-fraud verification questions');

        res = await request(`/lost-found/claims/${claim._id}/submit-verification`, {
          method: 'POST',
          token: tokenB,
          body: {
            answers: [{ questionId: 'q1', answer: 'GitHub and React stickers' }]
          }
        });
        recordResult('LostFound', 'POST', '/lost-found/claims/:claimId/submit-verification', 200, res.status, 'Claimant submits verification answers');

        res = await request(`/lost-found/claims/${claim._id}/verify`, {
          method: 'PATCH',
          token: tokenA
        });
        recordResult('LostFound', 'PATCH', '/lost-found/claims/:claimId/verify', 200, res.status, 'Finder approves verification answers');

        res = await request(`/lost-found/claims/${claim._id}/propose-meetup`, {
          method: 'POST',
          token: tokenA,
          body: {
            proposedLocation: 'Campus Cafeteria',
            proposedTime: new Date(Date.now() + 86400000).toISOString()
          }
        });
        recordResult('LostFound', 'POST', '/lost-found/claims/:claimId/propose-meetup', 200, res.status, 'Propose handover meetup');

        res = await request(`/lost-found/claims/${claim._id}/accept-meetup`, {
          method: 'PATCH',
          token: tokenB
        });
        recordResult('LostFound', 'PATCH', '/lost-found/claims/:claimId/accept-meetup', 200, res.status, 'Accept handover meetup');
      }
    }

    // 8. MODULE 8: CLAIM CHAT (/api/v1/claim-chats)
    let testClaimChat = null;
    const testClaimObj = await LostFoundClaim.findOne();
    if (testClaimObj) {
      testClaimChat = await ClaimChat.create({
        claim: testClaimObj._id,
        participants: [userA._id, userB._id],
        isActive: true
      });
    }

    if (testClaimChat) {
      res = await request(`/claim-chats/${testClaimChat._id}/messages`, { token: tokenA });
      recordResult('ClaimChat', 'GET', '/claim-chats/:chatId/messages', 200, res.status, 'Fetch claim chat history');

      res = await request(`/claim-chats/${testClaimChat._id}/meetup-proposal`, {
        method: 'POST',
        token: tokenA,
        body: {
          location: 'Library Steps',
          time: new Date(Date.now() + 86400000).toISOString()
        }
      });
      const proposalMsg = res.data?.data;
      recordResult('ClaimChat', 'POST', '/claim-chats/:chatId/meetup-proposal', 201, res.status, 'Propose meetup in claim chat');

      res = await request(`/claim-chats/${testClaimChat._id}/meetup-response`, {
        method: 'POST',
        token: tokenB,
        body: { messageId: proposalMsg?._id, accept: true }
      });
      recordResult('ClaimChat', 'POST', '/claim-chats/:chatId/meetup-response (Frontend Call)',
        200, res.status, 'Meetup response handled successfully');
    }

    // 9. MODULE 9: WANTED ITEMS (/api/v1/wanted-items)
    res = await request('/wanted-items', {
      method: 'POST',
      token: tokenB,
      body: {
        title: 'Need Engineering Mechanics Textbook',
        description: 'Semester 3 syllabus edition',
        category: 'Books',
        urgency: 'HIGH',
        maxBudget: 25
      }
    });
    const wantedPost = res.data?.data;
    recordResult('WantedItems', 'POST', '/wanted-items', 201, res.status, 'Create wanted item request');

    res = await request('/wanted-items', { token: tokenA });
    recordResult('WantedItems', 'GET', '/wanted-items', 200, res.status, 'Fetch campus wishlist posts');

    if (wantedPost) {
      res = await request(`/wanted-items/${wantedPost._id}/offers`, {
        method: 'POST',
        token: tokenA,
        body: {
          offerType: 'RENT',
          price: 15,
          message: 'I have the 4th edition in great shape'
        }
      });
      const offerId = res.data?.data?.offers?.[0]?._id;
      recordResult('WantedItems', 'POST', '/wanted-items/:id/offers', 201, res.status, 'Community member makes an offer');

      if (offerId) {
        res = await request(`/wanted-items/${wantedPost._id}/offers/${offerId}/accept`, {
          method: 'PATCH',
          token: tokenB
        });
        recordResult('WantedItems', 'PATCH', '/wanted-items/:id/offers/:offerId/accept', 200, res.status, 'Poster accepts offer and enables chat');
      }
    }

    // 10. MODULE 10: OFFER CHATS (/api/v1/offer-chats)
    res = await request('/offer-chats', { token: tokenB });
    recordResult('OfferChats', 'GET', '/offer-chats', 200, res.status, 'Fetch active offer chats');

  } catch (error) {
    console.error('Test execution error:', error);
  } finally {
    await server.close();
    await mongoose.disconnect();
    const passed = results.filter(r => r.passed && !r.isBug).length;
    const failed = results.filter(r => !r.passed || r.isBug).length;
    console.log('\n========================================');
    console.log(`TOTAL ENDPOINTS TESTED: ${results.length}`);
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED / BUGS: ${failed}`);
    console.log('========================================\n');

    if (failed > 0 || results.length === 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

runTestSuite();

