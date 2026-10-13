# Spec Delta

## Purpose

Deliver a polished, responsive first impression through a coherent scientific visual identity, readable content, and accessible interactions across devices.

## ADDED Requirements

### Requirement: Big reference visual identity
The site SHALL use the second supplied molecular image, named big in the conversation, as the primary theme reference: graphite backgrounds with cyan/teal and magenta accents. Primary content SHALL remain minimal and readable; the prior navy/violet/rose theme SHALL NOT determine the palette.

#### Scenario: Theme review
- **WHEN** the homepage and playable are reviewed together
- **THEN** graphite, cyan/teal, and magenta form their shared visual identity
- **AND** pale neutral text remains readable without competing with decorative scientific forms

### Requirement: Deliberate responsive composition
The site SHALL maintain a clear introduction, readable line lengths, consistent spacing, and usable navigation from 360px mobile to 1440px desktop widths, without horizontal page overflow or content overlap.

#### Scenario: Mobile and desktop review
- **WHEN** the site is viewed at 360px, 768px, and 1440px widths
- **THEN** content and controls remain readable and reachable without horizontal page scrolling
- **AND** the introduction and navigation do not overlap

### Requirement: Accessible controls and content
The site SHALL meet WCAG 2.2 AA contrast for text and functional UI, provide visible keyboard focus and semantic headings, and communicate interactive states through more than color alone. Primary touch controls SHALL have targets at least 44 by 44 CSS pixels.

#### Scenario: Keyboard navigation
- **WHEN** a visitor uses only the keyboard
- **THEN** navigation, contact links, and playable controls are reachable in a logical order with visible focus and no keyboard trap

#### Scenario: State perception
- **WHEN** the playable displays a goal, obstacle, or agent state
- **THEN** a label, symbol, or shape supplements its color

### Requirement: Purposeful motion
The site SHALL honor reduced-motion preferences, avoid decorative motion that obstructs reading, and provide an explicit pause control for ongoing playable animation.

#### Scenario: Reduced motion
- **WHEN** reduced motion is enabled
- **THEN** decorative movement and animated scrolling are removed or reduced without hiding content
- **AND** the experiment remains understandable through static states and explicit stepping

### Requirement: Independent first-load experience
The homepage SHALL render its introduction and navigation without waiting for model loading, scientific rendering, or playable initialization. Heavy experiment resources SHALL load only after explicit activation, and their failure SHALL NOT block the rest of the site.

#### Scenario: Experiment unavailable
- **WHEN** the experiment fails to initialize or its download fails
- **THEN** the introduction, experience, and contact content remain usable
- **AND** the lab presents a readable explanation and recovery control
