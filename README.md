# Snake-Game-with-Hand-Control
- A game which uses hand gestures to change the direction of the snake. 
- https://mysticxsam.github.io/Snake-Game-with-Hand-Control/
- This is a modern twist on the classic Snake game that uses hand gestures for control instead of keyboard input. Let me break down each component and how they work together.

## HTML Structure (index.html)
- Sets up the basic page with a title "AI Snake Game with Hand Control"
- Contains two main elements:
  - A `<canvas>` for the game display (600x600 pixels)
  - A webcam feed container with:
    - `<video>` element to show the camera feed
    - Another `<canvas>` to overlay hand tracking visuals
- Imports required scripts:
  - MediaPipe Hands library for hand tracking
  - Camera utilities
  - Our custom game.js and handTracking.js files

## CSS Styling (style.css)
- Provides a dark theme with blue accents
- Arranges the game canvas and camera feed side-by-side (stacked on mobile)
- Styles the game canvas with a border and shadow
- Styles the camera container with a red border and proper scaling
- Uses `transform: scaleX(-1)` to mirror the webcam feed (more intuitive for users)
- Makes the hand tracking canvas overlay the webcam feed with pointer events disabled

## Game Logic (game.js)

### Core Game Elements:
- **Grid System**: 20x20 grid (each tile is 30px since canvas is 600x600)
- **Snake**: Array of segments with positions and movement vectors
- **Food**: Randomly placed item for the snake to eat
- **Score**: Tracks how many food items have been eaten

### Key Features:
1. **Smooth Movement**:
   - Uses `smoothSteps` to create gradual movement between grid cells
   - Calculates intermediate positions for smoother animation

2. **Game Mechanics**:
   - Snake grows when eating food
   - Game ends on self-collision
   - Wraps around screen edges
   - Includes keyboard controls as fallback

3. **Rendering**:
   - Draws rounded rectangles for snake segments
   - Draws circular food
   - Special styling for the snake head
   - Game over screen with restart option

4. **Controls**:
   - Listens for keyboard arrow keys
   - Provides `setDirection()` function that hand tracking can use

## Hand Tracking (handTracking.js)

### Camera Setup:
- Requests access to user's webcam
- Sets up video feed with preferred resolution
- Initializes overlay canvas to match video dimensions

### MediaPipe Hands Integration:
- Configures hand tracking with:
  - Max 1 hand detected
  - Fast model (complexity 0)
  - Confidence thresholds for detection/tracking

### Hand Tracking Logic:
1. **Landmark Processing**:
   - Gets wrist, index finger tip, and thumb tip positions
   - Mirrors coordinates to match the mirrored webcam display

2. **Visual Feedback**:
   - Draws a cyan skeleton of the detected hand
   - Shows current detected direction as text overlay

3. **Gesture Detection**:
   - Calculates vector from wrist to index finger
   - Determines direction based on angle:
     - Right: -45° to 45°
     - Down: 45° to 135°
     - Left: 135° to -135°
     - Up: -45° to -135°
   - Only registers gesture when:
     - Finger is sufficiently extended from wrist
     - Thumb and index finger aren't pinched together

4. **Game Control**:
   - Calls the `setDirection()` function from game.js when valid gestures are detected

## How It All Works Together

1. The page loads and initializes both the game and camera systems.
2. The camera feed starts and MediaPipe processes each frame to detect hands.
3. When a hand is detected:
   - The system calculates the direction the index finger is pointing
   - This direction is sent to the game to control the snake
   - Visual feedback is shown on the camera feed
4. The game:
   - Updates snake position based on the current direction
   - Checks for collisions and food consumption
   - Renders the game state smoothly
5. If the snake collides with itself, the game ends and can be restarted

This project combines computer vision (hand tracking) with classic game programming to create an interactive experience that demonstrates how AI can be used for novel input methods in games.
