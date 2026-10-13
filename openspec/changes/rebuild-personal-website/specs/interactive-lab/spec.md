# Spec Delta

## Purpose

Let visitors explore machine learning through an approachable personal experiment, while keeping technical explanations honest and experiments independent of the surrounding website.

## ADDED Requirements

### Requirement: Explicit experiment entry
The lab SHALL show a concise description and an explicit launch control for one ML playable, with visible loading, ready, running, paused, and error states. The playable SHALL require no login, server inference, or private dataset.

#### Scenario: Launching the experiment
- **WHEN** a visitor activates the launch control
- **THEN** the lab loads the experiment and exposes its state and usable controls
- **AND** it does not start unrelated decorative animations or audio

### Requirement: Editable reward environment
The initial playable SHALL let visitors adjust a bounded navigation environment's reward settings, train an agent, and watch its resulting policy. Defaults SHALL provide a solvable environment and a concise explanation of the objective.

#### Scenario: Changing incentives
- **WHEN** a visitor changes a reward setting
- **THEN** the new setting is visible and any retained policy is clearly labeled as trained under previous settings or reset before retraining
- **AND** the visitor can train under the new settings

#### Scenario: Invalid configuration
- **WHEN** a visitor enters an out-of-range reward or attempts an unsupported environment edit
- **THEN** the control rejects it with an understandable message or prevents the edit
- **AND** the experiment remains usable

### Requirement: Genuine and explained learning
The playable SHALL learn action values from environment transitions rather than simulate progress with scripted behavior. It SHALL identify the algorithm, distinguish exploration from policy evaluation, and display actual episode and reward measurements with an accessible explanation.

#### Scenario: Training and evaluation
- **WHEN** a visitor trains and then watches the agent
- **THEN** training measurements reflect executed episodes and evaluation actions derive from the learned policy
- **AND** the explanation states that a small educational environment does not establish real-world RL performance

### Requirement: Bounded and controllable execution
The playable SHALL provide train, watch, pause, step, and reset controls, bounded episode lengths and training batches, and reproducible seeded resets. Pausing or leaving the experiment SHALL stop ongoing work and animation.

#### Scenario: Pause and reset
- **WHEN** a visitor pauses training or playback
- **THEN** computation and movement stop at a safe boundary and controls remain responsive
- **WHEN** the visitor resets with the same seed and settings
- **THEN** the environment and learning state return to the same initial configuration

#### Scenario: Nonterminating policy
- **WHEN** the agent fails to reach the goal within the episode step limit
- **THEN** the episode terminates and is reported as a timeout rather than a success

### Requirement: Accessible experiment interaction
The playable SHALL offer equivalent core operation through keyboard and touch controls, expose textual objective and progress summaries, and provide a readable fallback if its renderer or execution engine is unavailable.

#### Scenario: Keyboard-only play
- **WHEN** a visitor operates the experiment without a pointer
- **THEN** the visitor can change rewards, train, watch, pause, step, and reset
- **AND** objective and progress can be understood without interpreting the canvas alone

### Requirement: Experiment lifecycle isolation
An experiment failure or disposal SHALL leave site navigation and personal content operational. Repeated launch and disposal SHALL NOT create duplicate execution loops or continue background work after disposal.

#### Scenario: Reopening the playable
- **WHEN** a visitor launches, closes, and relaunches the experiment
- **THEN** only one active simulation exists and the experiment presents a coherent initial state
