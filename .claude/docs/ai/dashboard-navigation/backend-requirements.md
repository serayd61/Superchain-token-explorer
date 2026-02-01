# Backend Requirements: Dashboard & Navigation System

## Context

This document describes the data needs for the **Superchain Terminal** — an industrial-style dashboard for monitoring token activity across 19 Optimism Atlas eligible blockchain networks.

**Who uses it:**
- DeFi traders tracking cross-chain opportunities
- Developers building on Superchain networks
- Analysts monitoring ecosystem health
- Grant applicants demonstrating ecosystem impact

**Problem it solves:**
- Fragmented data across 19 different L2 networks
- No unified view of Superchain ecosystem health
- Difficulty tracking interop-ready tokens
- Manual effort required to compare chain performance

---

## Screens / Components

### Dashboard (Home)

**Purpose:**
The dashboard is the primary landing screen. It provides an at-a-glance overview of the entire Superchain ecosystem — system health, aggregate metrics, chain performance rankings, and recent activity.

**Data I need to display:**

1. **Aggregate Ecosystem Metrics**
   - Total number of chains (active vs total)
   - Total tokens being tracked across all chains
   - Combined 24-hour trading volume (USD)
   - Combined TVL estimate (USD)
   - Count of interop-ready tokens
   - Average data latency / last sync timestamp

2. **Chain Performance Summary**
   - For each chain: name, chain ID, token count, 24h volume, TVL, active status
   - Ability to sort by TVL, volume, or token count
   - Visual indicator of chain health (online/degraded/offline)

3. **Activity Feed**
   - Recent system events (new tokens detected, sync completions, alerts)
   - Timestamp for each event
   - Event severity/type classification

4. **Network Status Grid**
   - Visual representation of all 19 chains
   - Quick health indicator per chain
   - Token count per chain

**Actions:**
- Navigate to detailed chain view
- Navigate to token scanner
- Refresh data manually
- Filter activity feed by event type

**States to handle:**
- **Loading:** Initial data fetch, show skeleton/placeholder metrics
- **Empty:** No data available (unlikely but possible on fresh deployment)
- **Error:** API unreachable, show error state with retry option
- **Partial:** Some chains responding, others not — show available data with warnings
- **Stale:** Data older than expected threshold — indicate staleness visually

**Business rules affecting UI:**
- Chains marked as `is_active: false` should still appear but be visually distinct
- Volume and TVL calculations should exclude tokens without valid price data
- Activity feed should auto-refresh but not disrupt user reading

---

### Sidebar Navigation

**Purpose:**
The sidebar provides navigation between major sections of the application. It slides in from the left when the hamburger menu is clicked.

**Data I need to display:**

1. **Navigation Items**
   - Label for each section
   - Icon representation
   - Active/current page indicator
   - Optional status badge (e.g., "LIVE", "BETA", notification count)
   - Optional health indicator per section

2. **System Status Summary**
   - Quick system health indicator (operational/degraded/down)
   - Count of active chains
   - Last sync timestamp
   - Data latency metric
   - API health status

3. **Application Identity**
   - App name and version
   - Branding elements

**Actions:**
- Open sidebar (hamburger click)
- Close sidebar (overlay click, escape key, or close button)
- Navigate to different section
- Keyboard navigation support

**States to handle:**
- **Loading:** Navigation items should be available immediately (static list)
- **Disabled items:** Some sections may be unavailable based on system status
- **Error:** If system status check fails, show unknown state
- **Active state:** Current page should be visually highlighted

**Business rules affecting UI:**
- Navigation should remain functional even if data APIs are down
- Notification badges should update in real-time if possible
- Beta/experimental features should be clearly marked

---

### Token Scanner (Subpage)

**Purpose:**
Detailed token listing with search, filter, and sort capabilities. Primary tool for discovering and analyzing tokens.

**Data I need to display:**

1. **Token List**
   - Token symbol and name
   - Chain identifier
   - Current price (USD)
   - 24-hour price change (percentage)
   - 24-hour volume (USD)
   - Market cap (USD)
   - Liquidity status
   - Verification status
   - Interop-ready status

2. **Filter Options**
   - Chain selection (single or multi-select)
   - Search by name/symbol/address
   - Sort field selection

3. **Pagination / Results Info**
   - Total matching results
   - Current page / offset
   - Items per page

**Actions:**
- Search tokens
- Filter by chain
- Change sort order
- Navigate to token detail
- Refresh data

**States to handle:**
- **Loading:** Show loading indicator while fetching
- **Empty results:** No tokens match current filters
- **Error:** API failure
- **Partial data:** Some token fields may be null (price, volume)

**Business rules affecting UI:**
- Tokens without liquidity should be visually distinct
- Price changes should be color-coded (green positive, red negative)
- Interop-ready tokens should have special badge

---

### Chain Metrics (Subpage)

**Purpose:**
Detailed view of all 19 supported chains with their configuration and status.

**Data I need to display:**

1. **Chain Details**
   - Chain name and slug
   - Chain ID
   - Active status
   - Priority tier (1-4)
   - TVL rank
   - Explorer URL
   - DEX availability
   - DEX types supported

2. **Tier Summary**
   - Count of chains per tier
   - Tier descriptions

**Actions:**
- View chain explorer (external link)
- Filter by tier
- Sort by various metrics

**States to handle:**
- **Loading:** Show skeleton cards
- **Error:** API failure
- **Offline chains:** Visually indicate inactive chains

---

### Analytics (Subpage)

**Purpose:**
Historical trends and comparative analytics across the ecosystem.

**Data I need to display:**

1. **Time-series data**
   - Volume over time (by chain, aggregate)
   - TVL over time
   - Token count growth
   - Active user metrics (if available)

2. **Comparative metrics**
   - Chain vs chain comparisons
   - Top performing tokens
   - Trending tokens

**Actions:**
- Select time range (24h, 7d, 30d)
- Select chains to compare
- Export data

**States to handle:**
- **Loading:** Chart placeholders
- **Insufficient data:** Not enough history for selected range
- **Error:** Data fetch failure

---

### Interop Tracker (Subpage)

**Purpose:**
Track tokens that support Superchain interoperability (SuperchainERC20 standard).

**Data I need to display:**

1. **Interop Token List**
   - Token symbol
   - Canonical address
   - Chains where available
   - Cross-chain addresses mapping
   - Interop score

2. **Interop Status Check**
   - For any token: is it SuperchainERC20 compliant?
   - What interop features does it support?

**Actions:**
- Check token interop status
- View cross-chain addresses
- Compare prices across chains

**States to handle:**
- **Loading:** Checking token status
- **Not found:** Token doesn't exist
- **Not interop:** Token exists but isn't interop-ready

---

### Alerts (Subpage)

**Purpose:**
User-configured alerts for price movements, new tokens, and system events.

**Data I need to display:**

1. **Alert List**
   - Alert type
   - Trigger condition
   - Status (active/triggered/disabled)
   - Last triggered timestamp

2. **Alert History**
   - Past triggered alerts
   - Associated data at trigger time

**Actions:**
- Create new alert
- Edit existing alert
- Delete alert
- View alert history

**States to handle:**
- **Loading:** Fetching user alerts
- **Empty:** No alerts configured
- **Error:** Alert service unavailable

**Business rules affecting UI:**
- Alert count badge in navigation should reflect unread/new alerts
- Triggered alerts should be visually prominent

---

### Settings (Subpage)

**Purpose:**
User preferences and application configuration.

**Data I need to display:**

1. **User Preferences**
   - Default chain filter
   - Refresh interval preference
   - Notification preferences
   - Display preferences (theme, density)

2. **API Configuration**
   - API key management (if applicable)
   - Rate limit status
   - Usage statistics

**Actions:**
- Update preferences
- Generate/revoke API keys
- Export user data

**States to handle:**
- **Loading:** Fetching current settings
- **Saving:** Updating preferences
- **Error:** Save failure

---

## Shared Requirements Across All Subpages

1. **Navigation Consistency**
   - Sidebar should be accessible from all pages
   - Current page should be highlighted in navigation
   - Breadcrumb or page title should indicate location

2. **Data Freshness**
   - All pages should show last update timestamp
   - Auto-refresh should be configurable
   - Manual refresh should be available

3. **Error Handling**
   - Graceful degradation when APIs fail
   - Clear error messages
   - Retry mechanisms

4. **Responsive Behavior**
   - Desktop-first design
   - Mobile-aware adaptations
   - Touch-friendly on tablets

---

## Uncertainties

1. **Real-time vs Polling**
   - Currently assuming polling-based updates
   - Would WebSocket connections be available for real-time data?

2. **User Authentication**
   - Is user authentication required?
   - Are there different permission levels?
   - Should some data be user-specific?

3. **Data Retention**
   - How far back does historical data go?
   - What's the granularity of time-series data?

4. **Alert System**
   - Is there an existing alert/notification infrastructure?
   - How should alerts be delivered (in-app only, email, webhook)?

5. **Rate Limiting**
   - What are the API rate limits?
   - Should the frontend implement request throttling?

6. **Caching Strategy**
   - What data can be cached client-side?
   - What's the acceptable staleness for different data types?

---

## Questions for Backend

1. **Data Aggregation**
   - Should TVL and volume aggregations be pre-computed on the backend, or should the frontend calculate from individual chain data?
   - What's the preferred approach for "trending" token calculations?

2. **Activity Feed**
   - Is there an existing event/activity logging system?
   - What event types should be exposed to the frontend?
   - Should the activity feed be paginated or limited to recent N items?

3. **Interop Detection**
   - How expensive is the interop status check?
   - Should results be cached, and for how long?
   - Can we get batch interop status for multiple tokens?

4. **Historical Data**
   - What time ranges are supported for analytics?
   - What's the data point resolution (hourly, daily)?
   - Is there a separate endpoint for historical queries?

5. **Search Functionality**
   - Is full-text search available for token names?
   - Can we search by contract address?
   - Are there any search optimizations (fuzzy matching, autocomplete)?

6. **Performance Considerations**
   - What's the expected response time for the overview endpoint?
   - Are there any particularly slow queries we should be aware of?
   - Should we implement request batching for multiple data needs?

7. **Simpler Alternatives**
   - For the activity feed: could we use a simple polling endpoint instead of building a full event system?
   - For alerts: could we start with a simpler "watchlist" feature before full alert infrastructure?
   - For analytics: could we defer complex time-series to a future phase?

---

## Discussion Log

*(Reserved for backend team responses and ongoing dialogue)*

---

**Document Version:** 1.0  
**Last Updated:** January 2026  
**Frontend Contact:** [Frontend Developer]  
**Status:** Awaiting Backend Review
