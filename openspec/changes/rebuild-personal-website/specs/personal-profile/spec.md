# Spec Delta

## Purpose

Present Suraj Jena's professional experience and personal identity clearly to hiring managers and broader visitors, with trustworthy content and direct paths to further exploration.

## ADDED Requirements

### Requirement: Immediate personal introduction
The homepage SHALL identify Suraj Jena and explain his work across machine learning and software systems in concise language, with visible paths to selected experience, the lab, and contact information.

#### Scenario: First visit
- **WHEN** a visitor opens the homepage
- **THEN** the initial viewport identifies Suraj and his professional focus without requiring the playable to load or run
- **AND** navigation exposes experience, lab, and about/contact destinations

### Requirement: Source-backed selected experience
The site SHALL present selected professional experience derived from the supplied resume and LinkedIn materials, distinguishing employer work from personal experiments and avoiding invented outcomes, public project links, and unverified employment dates.

#### Scenario: Reviewing professional work
- **WHEN** a visitor reads selected experience
- **THEN** each entry identifies the employer or context, Suraj's contribution, and only supported outcomes
- **AND** ambiguous dates are omitted or presented at an agreed coarser granularity

#### Scenario: New playable attribution
- **WHEN** the lab experiment is presented alongside professional experience
- **THEN** it is identified as a personal educational experiment rather than an employer deployment or an existing professional RL achievement

### Requirement: Navigable personal content
The site SHALL provide usable experience, lab, and about/contact sections with shareable fragment destinations, standard browser navigation, and no empty writing or project sections that imply nonexistent content.

#### Scenario: Direct section access
- **WHEN** a visitor opens a section fragment or follows a navigation link
- **THEN** the corresponding section is visible and its heading is not obscured by navigation
- **AND** browser back navigation remains usable

### Requirement: Contact and resume access
The site SHALL provide working GitHub, LinkedIn, email, and downloadable supplied-resume links. It SHALL omit a public telephone number by default and SHALL NOT invent personal interests or availability claims.

#### Scenario: Exploring further
- **WHEN** a visitor activates a profile, email, or resume link
- **THEN** it opens the intended profile, initiates an email, or retrieves a readable resume PDF without authentication

### Requirement: Personal site metadata
The site SHALL expose an owner-specific page title, description, and site icon, and SHALL omit obsolete demo branding and unconfirmed production-domain metadata.

#### Scenario: Shared or bookmarked homepage
- **WHEN** a visitor inspects page metadata or bookmarks the homepage
- **THEN** it identifies Suraj's personal site rather than React App or the original demo
