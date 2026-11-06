# Feature Specification: User Authentication and Role-Based Access Control

**Feature Branch**: `002-user-access-management`

**Created**: 2026-11-06

**Status**: Draft

**Input**: User description: "we need a login screen and tho that we can change the users, the master could watch all the info and delete users, create, put credentials and all that, and tho the there must be a category with only access to the price list"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Secure Authentication & Session Switching (Priority: P1)

As an authorized staff member, I need a dedicated login screen where I can securely sign in with my assigned credentials and access the application according to my permissions, as well as a quick way to log out or switch user sessions when different team members share a workstation.

**Why this priority**: Authentication is the foundational security boundary of the application. Without a login mechanism, sensitive commercial figures, profit margins, and administrative tools cannot be protected, and multi-user accountability is impossible.

**Independent Test**: An unauthenticated user attempting to open any page is redirected to the login screen. Submitting valid credentials signs the user in and loads their permitted interface. Selecting "Switch User" or "Log Out" cleanly terminates the session and returns to the login screen.

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor, **When** they navigate to any system screen or address, **Then** they are redirected immediately to the login screen.
2. **Given** a user on the login screen, **When** they submit valid credentials (username and password), **Then** they are authenticated and redirected to the appropriate dashboard corresponding to their assigned category/role.
3. **Given** a user on the login screen, **When** they submit invalid credentials, **Then** an informative error message is displayed and the user remains unauthenticated.
4. **Given** an active authenticated session, **When** the user clicks "Switch User" or "Log Out", **Then** the current session is terminated and the application returns to the login screen, ready for the next user.

---

### User Story 2 - Master User Management & Credential Administration (Priority: P2)

As a Master user (system administrator), I need a dedicated user administration interface where I can view all registered accounts, create new user profiles, set and update their credentials, assign roles/categories, and delete or deactivate users.

**Why this priority**: Enables central governance of all staff accounts. The Master administrator must control who can enter the system, assign the correct access tier, and quickly revoke access or reset forgotten credentials.

**Independent Test**: A Master user logs in, opens the User Management screen, creates a new user with credentials and a designated role, updates an existing user's details, resets a password, and deletes an inactive account, verifying that all changes take immediate effect.

**Acceptance Scenarios**:

1. **Given** an authenticated Master user, **When** they navigate to the User Management section, **Then** a full roster of all user accounts is displayed showing username, full name, assigned role/category, active status, and creation date.
2. **Given** a Master user in the user creation interface, **When** they enter account details (username, name, initial password, and role selection) and submit, **Then** the new user account is created and can immediately log in with those credentials.
3. **Given** a Master user managing an existing account, **When** they update the user's information or reset their password, **Then** the changes take effect and the user must use the new credentials on subsequent logins.
4. **Given** a Master user, **When** they delete or deactivate an account, **Then** the user account is removed from active status and cannot log in.
5. **Given** a Master user attempting to delete their own account or the sole remaining Master account in the system, **Then** the system rejects the operation with a warning to prevent total administrative lockout.

---

### User Story 3 - Restricted "Price List" Role Access (Priority: P3)

As a retail salesperson or counter clerk assigned to the "Price List" category, I need direct access to the product price list so that I can look up sales prices, currency conversions, and customer promotion rates while being strictly restricted from viewing confidential cost formulas, margins, fixed expenses, or administrative settings.

**Why this priority**: Protects sensitive financial formulas, supplier costs, and executive operations while giving front-line sales personnel the exact data they need to serve customers efficiently.

**Independent Test**: Log in with an account assigned to the "Price List" category; verify that the user can search, filter, and view sales prices in both local and foreign currencies, but cannot view supplier wholesale costs, profit margins, break-even targets, sales records, or user management tools.

**Acceptance Scenarios**:

1. **Given** a user belonging to the "Price List" category, **When** they log in, **Then** they are directed directly to the Price List screen showing item descriptions, codes, official retail prices, and promotional rates in both currencies (USD and Bolívares).
2. **Given** a user in the "Price List" category, **When** they view any product or catalog row, **Then** purchase costs, supplier replacement rates, contribution margin percentages, and gross profit amounts are completely hidden from view.
3. **Given** a user in the "Price List" category, **When** they attempt to navigate to restricted modules (Cost Configuration, Sales Recording, Break-Even Analysis, Dashboard, or User Management), **Then** access is denied, unauthorized navigation links are hidden, and the user is kept within the Price List area.

---

### User Story 4 - Master Comprehensive Information Oversight (Priority: P4)

As a Master user, I need complete and unrestricted visibility across all application modules—including pricing formulas, supplier costs, margin calculations, point-of-sale transaction logs, fixed operating expenses, break-even financial indicators, and user management—so that I have full operational and financial control.

**Why this priority**: Delivers the "master could watch all the info" requirement, ensuring business leadership retains full oversight and administrative autonomy over the entire platform.

**Independent Test**: Log in with a Master account and verify that all system modules, reports, margin configurations, cost structures, and administrative controls are fully visible and editable.

**Acceptance Scenarios**:

1. **Given** an authenticated Master user, **When** they navigate throughout the application, **Then** all navigation options, financial indicators, cost data, margin percentages, and administrative actions are visible and accessible.
2. **Given** an authenticated Master user, **When** they inspect product pricing details, **Then** both wholesale supplier costs and retail sales prices are shown with their underlying margin formulas.

---

### Edge Cases

- **Sole Master Protection**: If a Master user attempts to delete or demote their own account or the only active Master account, the system prevents the action and displays an error explaining that at least one active Master account must always exist.
- **Deactivated User with Active Session**: If a user is deactivated or deleted by the Master while currently signed in, their active session is invalidated on their next interaction, redirecting them to the login screen with an account deactivated notification.
- **Direct URL Tampering by Restricted Users**: If a user assigned to the "Price List" category manually enters a URL for administrative or financial cost pages, the system blocks access and redirects them to the Price List with an access notice.
- **Initial System Bootstrap**: Upon first deployment when no accounts exist, the system initializes with a default Master credential setup that prompts the initial administrator to secure their credentials upon first sign-in.
- **Session Expiration on Idle Terminals**: When a terminal is left inactive past the configured session threshold, the session expires safely and any subsequent user interaction prompts for login.
- **Repeated Authentication Failures**: If repeated incorrect passwords are submitted for an account, the system enforces a temporary cooldown delay to mitigate automated guessing.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a dedicated login screen requiring username and password credentials before granting access to any application features.
- **FR-002**: System MUST protect all operational screens and data behind authentication, redirecting unauthenticated visitors to the login screen.
- **FR-003**: System MUST provide a prominent "Switch User" / "Log Out" option on every authenticated screen that terminates the current session and returns to the login screen.
- **FR-004**: System MUST support distinct user roles, including at minimum:
  - **Master**: Full administrative privileges, user management, and unrestricted access to all financial and operational data.
  - **Price List Viewer**: Restricted read-only access limited strictly to the sales price list.
- **FR-005**: System MUST allow Master users to access a dedicated User Management screen displaying all registered users, their full names, usernames, assigned roles, and current statuses.
- **FR-006**: System MUST allow Master users to create new user accounts, specifying username, display name, initial credentials (password), and assigned role.
- **FR-007**: System MUST allow Master users to edit existing user profiles, reassign roles, and reset user passwords.
- **FR-008**: System MUST allow Master users to deactivate or permanently delete user accounts.
- **FR-009**: System MUST strictly prevent the deletion, deactivation, or role demotion of the final active Master user account.
- **FR-010**: System MUST enforce role-based access control such that users assigned to the "Price List Viewer" category can only view the sales price list view.
- **FR-011**: System MUST completely hide and exclude sensitive commercial financial fields (supplier purchase costs, supplier replacement rates, profit margin percentages, and gross margin totals) from the Price List Viewer interface.
- **FR-012**: System MUST grant Master users unrestricted access to all catalog details, price calculation formulas, point-of-sale transaction ledgers, fixed operational cost structures, and break-even analytics.
- **FR-013**: System MUST immediately terminate active sessions associated with a user account when that account is deactivated or deleted by the Master.
- **FR-014**: System MUST provide an initial bootstrap Master account on initial installation so the system owner can establish administrative access.

### Key Entities *(include if feature involves data)*

- **User Account**: Represents an individual staff member with system access. Key attributes include unique identifier, username, display name, credential reference, assigned role, active status (active/inactive), last login timestamp, creation timestamp, and update timestamp.
- **Role / Category**: Represents an access tier that defines permission boundaries. Key attributes include role identifier, display name, and permitted system views (e.g., Master: all views; Price List Viewer: price list only).
- **User Session**: Represents an active authenticated state for a logged-in user on a device, tracking identity, role tier, session establishment time, and expiration time.
- **Sanitized Price List View**: A customer-facing price projection derived from the master product catalog that includes product code, product description, retail price in USD, retail price in Bolívares, cash promo price, and secondary promo price, strictly omitting supplier cost and margin attributes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the login process and reach their authorized view in under 3 seconds after submitting valid credentials.
- **SC-002**: 100% of unauthorized route requests and data queries made by restricted users to financial cost or user administration pages are prevented.
- **SC-003**: Master users can create a new user account with credentials and role assignment in under 60 seconds.
- **SC-004**: Users can initiate session switching or logout with a single click from any system screen, returning to the login screen in under 1 second.
- **SC-005**: 0% of confidential financial indicators (supplier costs, profit margins, fixed expenses) are visible or retrievable in the Price List Viewer role.
- **SC-006**: 100% prevention of administrative lockout; system guarantees at least one active Master user account exists at all times.

## Assumptions

- Users operate the application from desktop and tablet workstations located at retail sales counters and administrative offices.
- Staff accounts are managed and provisioned directly by the business owner/Master; public self-registration is intentionally disabled.
- Password credentials require standard minimum length and security hygiene suitable for small-to-medium retail operations.
- The Price List Viewer role is designed specifically for sales staff to look up and quote prices for walk-in customers without exposing store wholesale margins.
- A default initial Master account is provisioned during initial setup, with credentials clearly documented for the initial administrator.
