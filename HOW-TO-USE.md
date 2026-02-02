# ShareNet - Complete User Guide

> **ShareNet** is a Campus Sharing Platform where university students can rent, sell, or give away items to each other, find lost items, and request items they need.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Item Sharing](#item-sharing)
4. [Requests & Transactions](#requests--transactions)
5. [Lost & Found](#lost--found)
6. [Wanted Items](#wanted-items)
7. [Real-Time Chat](#real-time-chat)
8. [Notifications](#notifications)
9. [Trust Score System](#trust-score-system)
10. [Quick Start Guides](#quick-start-guides)

---

## Getting Started

### Prerequisites
- A valid campus email address (must end with `.edu`)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Accessing the Application
- **Frontend URL:** `http://localhost:5173`
- **Backend API:** `http://localhost:8000/api/v1`

---

## Authentication

### Register a New Account

1. Navigate to `/register`
2. Fill in the registration form:
   - **Full Name** - Your display name
   - **Username** - Unique identifier (lowercase)
   - **Email** - Must be a campus email ending in `.edu`
   - **Password** - Secure password
3. Click **Sign Up**
4. You'll be redirected to login

### Login

1. Navigate to `/login`
2. Enter your email and password
3. Click **Login**
4. You'll be redirected to the home page

### Profile Management

1. Navigate to `/profile`
2. View your:
   - Profile information
   - Trust Score
   - Transaction history
3. Update your:
   - Full Name
   - Avatar photo
   - Account settings

---

## Item Sharing

### Browsing Items

**URL:** `/items`

1. View all available items on the platform
2. Use filters to narrow down:
   - **Category:** Electronics, Books, Furniture, Clothing, Sports, Kitchen, Other
   - **Mode:** Rent, Sell, Give
   - **Condition:** New, Like New, Good, Fair, Poor
3. Click on any item to view details

### Viewing Item Details

**URL:** `/items/:id`

- See full item description
- View all photos (up to 5)
- Check availability and pricing
- See owner's profile and trust score
- **Request** the item if interested

### Listing Your Items

**URL:** `/my-items/new`

1. Click **"List an Item"** or navigate to `/my-items/new`
2. Fill in the item form:

| Field | Description |
|-------|-------------|
| **Title** | Name of your item |
| **Description** | Detailed description |
| **Photos** | Upload up to 5 photos |
| **Category** | Select from available categories |
| **Mode** | RENT, SELL, or GIVE |
| **Price** | Required for RENT/SELL modes |
| **Condition** | Current state of the item |
| **Pickup Location** | Where to collect the item |

3. Click **Create Item**

### Managing Your Items

**URL:** `/my-items`

- View all items you've listed
- **Edit** item details
- **Toggle availability** on/off
- **Delete** items you no longer want to list
- See request count for each item

---

## Requests & Transactions

### Making a Request

1. Find an item you want at `/items`
2. Click on the item to view details
3. Click **"Request Item"**
4. Write a message explaining:
   - Why you need the item
   - How long you need it (for rentals)
   - Any other relevant information
5. Submit the request

### Managing Requests

**URL:** `/requests`

#### Sent Requests (As Requester)
- View all requests you've sent
- See status: Pending, Accepted, Rejected
- Cancel pending requests if needed

#### Received Requests (As Owner)
- View requests for your items
- **Accept** - Creates a transaction
- **Reject** - Decline the request with optional reason

### Transaction Workflow

**URL:** `/transactions` and `/transactions/:id`

#### Transaction Statuses

```
ACCEPTED → AGREEMENT_PROPOSED → ACTIVE → RETURN_PENDING → COMPLETED
                                              ↓
                                          DISPUTED
```

| Status | Description |
|--------|-------------|
| **ACCEPTED** | Request accepted, awaiting agreement |
| **AGREEMENT_PROPOSED** | Owner proposed terms |
| **ACTIVE** | Both parties agreed, transaction in progress |
| **RETURN_PENDING** | Requester marked item as returned |
| **COMPLETED** | Owner confirmed return |
| **DISPUTED** | Issue raised by either party |

#### As an Owner:

1. **Propose Agreement** after accepting request:
   - Set final price
   - Set duration (for rentals)
   - Add terms and conditions
   - Set start date

2. **Wait for requester** to confirm

3. **Confirm return** when item is returned (for rentals)

#### As a Requester:

1. **Review agreement** proposed by owner

2. **Confirm agreement** if you accept terms

3. **Mark as returned** when you return the item (for rentals)

#### Raising a Dispute:

If issues arise:
1. Go to transaction detail
2. Click **"Raise Dispute"**
3. Explain the issue
4. Wait for resolution

---

## Lost & Found

### Overview

The Lost & Found system helps reunite lost items with their owners.

- **LOST Posts:** You lost something, others claim they found it
- **FOUND Posts:** You found something, others claim it's theirs

### Browsing Lost & Found

**URL:** `/lost-found`

1. View all lost and found posts
2. Filter by:
   - Type (Lost / Found)
   - Category
   - Urgency
   - Location
3. See statistics (items found, returned, success rate)

### Creating a Post

**URL:** `/lost-found/create`

1. Click **"Report Item"**
2. Select post type:
   - **Lost** - If you lost something
   - **Found** - If you found something
3. Fill in details:

| Field | Description |
|-------|-------------|
| **Title** | Brief description of item |
| **Description** | Detailed description with identifying features |
| **Photo** | Upload a photo if available |
| **Location** | Where it was lost/found |
| **Category** | Type of item |
| **Urgency** | Low, Medium, High, Critical |
| **Verification Questions** | Security questions only true owner can answer |

4. Click **Create Post**

### Submitting a Claim

**URL:** `/lost-found/:id`

1. Find a post that matches your lost item (or something you found)
2. Click:
   - **"I Found It"** - For LOST posts
   - **"This is Mine"** - For FOUND posts
3. Write a message with proof/details
4. Answer verification questions (if any)
5. Submit claim

### Managing Claims

**URL:** `/lost-found/claims`

#### Claims I Made (As Claimant)
- View status of your claims
- Answer verification questions if required
- Access chat once verified

#### Claims Received (As Post Owner)
- Review incoming claims
- **Start Verification** - Send verification questions
- **Approve** - Verify the claim (enables chat)
- **Reject** - Reject invalid claims

### Claim Statuses

```
PENDING → VERIFICATION → VERIFIED → RESOLVED
              ↓
          REJECTED
```

| Status | Description |
|--------|-------------|
| **PENDING** | Awaiting review |
| **VERIFICATION** | Verification questions sent |
| **VERIFIED** | Claim approved, chat enabled |
| **REJECTED** | Claim denied |
| **RESOLVED** | Item successfully returned |

### Claim Chat

**URL:** `/lost-found/chat/:claimId` or `/lost-found/chat`

Once a claim is **VERIFIED**:
1. Chat becomes available
2. Coordinate meetup details
3. Share location
4. Propose meetup time/place
5. Complete the exchange

---

## Wanted Items

### Overview

The Wanted Items system lets you post items you're looking for, and others can offer to provide them.

### Browsing Wanted Items

**URL:** `/wanted`

1. View all wanted item posts
2. Filter by category, urgency, budget
3. See items people in your community need

### Creating a Wanted Post

**URL:** `/wanted/create`

1. Click **"Post Wanted Item"**
2. Fill in details:

| Field | Description |
|-------|-------------|
| **Title** | What you're looking for |
| **Description** | Detailed requirements |
| **Category** | Type of item needed |
| **Budget Type** | Any, Free Only, Max Price |
| **Max Amount** | Maximum you'll pay (if applicable) |
| **Urgency** | Low, Medium, High, Urgent |
| **Quantity** | How many you need |
| **Preferred Condition** | Any, New, Like New, Good, Fair |

3. Click **Create**

### Submitting an Offer

**URL:** `/wanted/:id`

1. Find a wanted post you can fulfill
2. Click **"Make Offer"**
3. Fill in offer details:

| Field | Description |
|-------|-------------|
| **Offer Type** | Free, Sell, or Rent |
| **Price** | Your asking price (if not free) |
| **Message** | Describe what you're offering |
| **Photos** | Upload photos of your item |

4. Submit offer

### Managing Offers

**URL:** `/wanted/my-offers`

#### Offers I Made (As Offerer)
- View status of your offers
- Access chat once accepted
- Cancel pending offers

#### Offers Received (As Requester)
- Review incoming offers
- **Accept** - Enable chat with offerer
- **Reject** - Decline the offer

### Offer Statuses

| Status | Description |
|--------|-------------|
| **PENDING** | Awaiting review |
| **ACCEPTED** | Offer accepted, chat enabled |
| **REJECTED** | Offer declined |
| **CANCELLED** | Offer withdrawn |

### Offer Chat

**URL:** `/wanted/chat/:offerId`

Once an offer is **ACCEPTED**:
1. Chat becomes available
2. Discuss item details
3. Share location
4. Propose meetup
5. Complete the exchange

---

## Real-Time Chat

### Available In:
- Transaction chats (`/transactions/:id`)
- Claim chats (`/lost-found/chat/:claimId`)
- Offer chats (`/wanted/chat/:offerId`)

### Chat Features

| Feature | Description |
|---------|-------------|
| **Text Messages** | Send and receive messages instantly |
| **Typing Indicator** | See when other person is typing |
| **Share Location** | Send your current GPS location |
| **Propose Meetup** | Suggest a meeting time and place |
| **Image Sharing** | Send photos |
| **Read Receipts** | Know when messages are read |

### How to Use Chat Features

#### Sending Messages
1. Type in the message box
2. Press Enter or click Send

#### Sharing Location
1. Click the 📍 location icon
2. Allow browser to access location
3. Location link is sent

#### Proposing Meetup
1. Click the 📅 calendar icon
2. Fill in:
   - Date
   - Time
   - Location
   - Notes (optional)
3. Click **Send Proposal**
4. Other party can Accept or Decline

---

## Notifications

**URL:** `/notifications`

### Notification Types

| Type | Description |
|------|-------------|
| **Request Received** | Someone requested your item |
| **Request Accepted** | Your request was accepted |
| **Request Rejected** | Your request was declined |
| **Agreement Proposed** | Owner proposed transaction terms |
| **Agreement Confirmed** | Terms were confirmed |
| **Return Reminder** | Reminder before return date |
| **Overdue Alert** | Item is past due date |
| **Dispute Raised** | Issue reported on transaction |
| **Claim Received** | Someone claimed your L&F post |
| **Claim Verified** | Your claim was approved |
| **Offer Received** | Someone offered for your wanted item |
| **Offer Accepted** | Your offer was accepted |

### Managing Notifications
- Click bell icon in navbar to see notifications
- Unread count shown as badge
- Click notification to navigate to relevant page
- Mark individual or all as read

---

## Trust Score System

### What is Trust Score?

Trust Score is a reputation metric (0-100) that reflects your reliability on the platform.

### Starting Score
- All new users start at **50/100**

### Score Changes

| Action | Effect |
|--------|--------|
| On-time return | ⬆️ +5 points |
| Successful transaction | ⬆️ +3 points |
| Late return (1-3 days) | ⬇️ -5 points |
| Late return (3+ days) | ⬇️ -10 points |
| Dispute raised against you | ⬇️ -15 points |
| Dispute resolved in your favor | ⬆️ +5 points |

### Trust Score Benefits
- Higher visibility in search results
- More likely to have requests accepted
- Builds community trust

### Viewing Trust Score
- Your score: `/profile`
- Others' scores: Shown on their profile and item listings

---

## Quick Start Guides

### 🎯 I Want to Borrow/Buy Something

1. **Browse** → Go to `/items`
2. **Find** → Use filters to find what you need
3. **Request** → Click item → "Request Item" → Send message
4. **Wait** → Owner reviews your request
5. **Confirm** → Accept the proposed agreement
6. **Chat** → Coordinate pickup with owner
7. **Return** → Return item and mark as returned (if rental)
8. **Done** → Trust score increases! 🎉

### 🎯 I Want to Lend/Sell Something

1. **List** → Go to `/my-items/new`
2. **Create** → Fill in item details, upload photos
3. **Publish** → Click "Create Item"
4. **Wait** → Receive requests at `/requests`
5. **Accept** → Accept a request
6. **Propose** → Set agreement terms
7. **Chat** → Coordinate with requester
8. **Complete** → Confirm return (if rental)
9. **Done** → Trust score increases! 🎉

### 🎯 I Lost Something

1. **Report** → Go to `/lost-found/create`
2. **Select** → Choose "Lost Item"
3. **Describe** → Add details, photo, location
4. **Security** → Add verification questions
5. **Post** → Submit the post
6. **Wait** → Check claims at `/lost-found/claims`
7. **Verify** → Review and verify legitimate claims
8. **Chat** → Coordinate return with finder
9. **Resolve** → Mark post as resolved
10. **Done** → Item recovered! 🎉

### 🎯 I Found Something

1. **Report** → Go to `/lost-found/create`
2. **Select** → Choose "Found Item"
3. **Describe** → Add details, photo, location
4. **Post** → Submit the post
5. **Wait** → Check claims at `/lost-found/claims`
6. **Verify** → Verify the true owner
7. **Chat** → Coordinate return
8. **Resolve** → Mark post as resolved
9. **Done** → Good deed done! 🎉

### 🎯 I Need Something Specific

1. **Post** → Go to `/wanted/create`
2. **Describe** → What you need, budget, urgency
3. **Publish** → Submit the post
4. **Wait** → Check offers at `/wanted/my-offers`
5. **Review** → Compare offers
6. **Accept** → Accept the best offer
7. **Chat** → Coordinate with offerer
8. **Done** → Got what you needed! 🎉

### 🎯 I Can Help Someone

1. **Browse** → Go to `/wanted`
2. **Find** → Look for requests you can fulfill
3. **Offer** → Click "Make Offer"
4. **Describe** → What you're offering, price
5. **Wait** → Requester reviews your offer
6. **Chat** → Coordinate if accepted
7. **Done** → Helped a fellow student! 🎉

---

## URL Reference

| Page | URL | Auth Required |
|------|-----|---------------|
| Home | `/` | No |
| Login | `/login` | No |
| Register | `/register` | No |
| Browse Items | `/items` | No |
| Item Detail | `/items/:id` | No |
| Profile | `/profile` | Yes |
| My Items | `/my-items` | Yes |
| Create Item | `/my-items/new` | Yes |
| Edit Item | `/my-items/:id/edit` | Yes |
| Requests | `/requests` | Yes |
| Transactions | `/transactions` | Yes |
| Transaction Detail | `/transactions/:id` | Yes |
| Notifications | `/notifications` | Yes |
| Lost & Found | `/lost-found` | Yes |
| Create L&F Post | `/lost-found/create` | Yes |
| L&F Post Detail | `/lost-found/:id` | Yes |
| My Claims | `/lost-found/claims` | Yes |
| Claim Chat | `/lost-found/chat/:claimId` | Yes |
| Claim Chat List | `/lost-found/chat` | Yes |
| Wanted Items | `/wanted` | Yes |
| Create Wanted | `/wanted/create` | Yes |
| Wanted Detail | `/wanted/:id` | Yes |
| My Offers | `/wanted/my-offers` | Yes |
| Offer Chat | `/wanted/chat/:offerId` | Yes |

---

## Need Help?

If you encounter any issues:
1. Check this guide for instructions
2. Ensure you're logged in for protected pages
3. Check your notifications for updates
4. Contact support if issues persist

---

*ShareNet - Share More, Spend Less* 🌐
