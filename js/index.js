// Extend the base functionality of JavaScript
Array.prototype.last = function () {
  return this[this.length - 1];
};

// A sinus function that accepts degrees instead of radians
Math.sinus = function (degree) {
  return Math.sin((degree / 180) * Math.PI);
};

// Game data
let phase = "waiting";
let lastTimestamp;
let heroX;
let heroY;
let sceneOffset;
let platforms = [];
let sticks = [];
let trees = [];
let birds = [];
let clouds = [];
let stars = [];
let weather = "sunshine"; // "rain", "sunshine", "fog"
let timeOfDay = "day"; // "day", "night", "autumn"
let hasShield = false;
let isMuted = false;
let score = 0;
let activePowerUps = []; // Track active power-ups (e.g., ["speedBoost", "shield"])
let gameOver = false; // Flag to track if the game has ended

// Audio elements (initialized but not played until user interaction)
const backgroundMusic = document.getElementById("backgroundMusic");
const stretchSound = document.getElementById("stretchSound");
const landSound = document.getElementById("landSound");
const fallSound = document.getElementById("fallSound");
const starSound = document.getElementById("starSound");

// Configuration
let walkingSpeed = 4; // Made mutable with `let` to allow changes
const canvasWidth = 375;
const canvasHeight = 375;
const platformHeight = 100;
const heroDistanceFromEdge = 10;
const paddingX = 100;
const perfectAreaSize = 10;
const backgroundSpeedMultiplier = 0.2;

const hill1BaseHeight = 100;
const hill1Amplitude = 10;
const hill1Stretch = 1;
const hill2BaseHeight = 70;
const hill2Amplitude = 20;
const hill2Stretch = 0.5;

const stretchingSpeed = 4;
const turningSpeed = 4;
const transitioningSpeed = 2;
const fallingSpeed = 2;

const heroWidth = 17;
const heroHeight = 30;

const canvas = document.getElementById("game");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");

const introductionElement = document.getElementById("introduction");
const perfectElement = document.getElementById("perfect");
const restartButton = document.getElementById("restart");
const muteButton = document.getElementById("mute");
const scoreElement = document.getElementById("score");
const powerUpElement = document.getElementById("powerUp"); // Container for power-up icons
const shieldIndicator = document.getElementById("shieldIndicator"); // Persistent shield indicator
const leaderboardElement = document.getElementById("leaderboard");
const leaderboardList = document.getElementById("leaderboardList");

// Initialize layout
resetGame();

function resetGame() {
  // Reset game state
  phase = "waiting";
  lastTimestamp = undefined; // Ensure this is undefined for a fresh start
  sceneOffset = 0;
  score = 0;
  hasShield = false;
  walkingSpeed = 4; // Reset walking speed to default
  weather = "sunshine"; // Ensure a valid default weather state
  timeOfDay = "day"; // Ensure a valid default time of day
  activePowerUps = []; // Clear active power-ups
  gameOver = false; // Reset game-over flag

  // Reset UI
  introductionElement.style.opacity = 1;
  perfectElement.style.opacity = 0;
  restartButton.style.display = "none";
  leaderboardElement.style.display = "none";
  scoreElement.innerText = score;
  updatePowerUpUI(); // Clear power-up display
  shieldIndicator.style.display = "none"; // Hide shield indicator on reset

  // Reset game objects
  platforms = [{ x: 50, w: 50 }];
  generatePlatform();
  generatePlatform();
  generatePlatform();
  generatePlatform();

  sticks = [{ x: platforms[0].x + platforms[0].w, length: 0, rotation: 0 }];

  trees = [];
  generateTree();
  generateTree();
  generateTree();
  generateTree();
  generateTree();
  generateTree();
  generateTree();
  generateTree();
  generateTree();
  generateTree();

  birds = [];
  generateBird();
  generateBird();

  clouds = [];
  generateCloud();
  generateCloud();
  generateCloud();

  stars = [];
  generateStar();
  generateStar();

  // Reset hero position
  heroX = platforms[0].x + platforms[0].w - heroDistanceFromEdge;
  heroY = 0;

  // Force a redraw to ensure all elements are visible
  draw();

  // Restart the animation loop explicitly
  window.requestAnimationFrame(animate); // Ensure animation loop restarts
}

function generateTree() {
  const minimumGap = 30;
  const maximumGap = 150;
  const lastTree = trees[trees.length - 1];
  let furthestX = lastTree ? lastTree.x : 0;

  const x = furthestX + minimumGap + Math.floor(Math.random() * (maximumGap - minimumGap));
  const treeColors = ["#6D8821", "#8FAC34", "#98B333"];
  const color = treeColors[Math.floor(Math.random() * 3)];

  trees.push({ x, color });
}

function generatePlatform() {
  const minimumGap = 40;
  const maximumGap = 200;
  const minimumWidth = 20;
  const maximumWidth = 100;

  const lastPlatform = platforms[platforms.length - 1];
  let furthestX = lastPlatform ? lastPlatform.x + lastPlatform.w : 0;

  const x = furthestX + minimumGap + Math.floor(Math.random() * (maximumGap - minimumGap));
  const w = minimumWidth + Math.floor(Math.random() * (maximumWidth - minimumWidth));
  const powerUp = Math.random() < 0.3 ? ["speedBoost", "doubleScore", "shield"][Math.floor(Math.random() * 3)] : null;

  platforms.push({ x, w, powerUp });
}

function generateBird() {
  const minimumGap = 200;
  const maximumGap = 500;
  const lastBird = birds[birds.length - 1];
  let furthestX = lastBird ? lastBird.x : window.innerWidth;

  const x = furthestX + minimumGap + Math.floor(Math.random() * (maximumGap - minimumGap));
  const y = Math.random() * (window.innerHeight * 0.3);
  const speed = 1 + Math.random() * 2;
  const direction = Math.random() < 0.5 ? -1 : 1;

  birds.push({ x, y, speed, direction });
}

function generateCloud() {
  const x = Math.random() * window.innerWidth;
  const y = 50 + Math.random() * 100;
  const speed = 0.5 + Math.random() * 1;
  clouds.push({ x, y, speed });
}

function generateStar() {
  const minimumGap = 100;
  const maximumGap = 300;
  const lastStar = stars[stars.length - 1];
  let furthestX = lastStar ? lastStar.x : window.innerWidth;

  const x = furthestX + minimumGap + Math.floor(Math.random() * (maximumGap - minimumGap));
  const y = Math.random() * (window.innerHeight * 0.5) + 50; // Above platforms
  const value = 10; // Points for collecting

  stars.push({ x, y, value });
}

function playSound(sound) {
  if (!isMuted && sound) {
      sound.currentTime = 0; // Reset to start
      sound.play().catch(error => console.log("Audio play error:", error));
  }
}

canvas.addEventListener("touchstart", handleStart, { passive: false });
canvas.addEventListener("touchend", handleEnd, { passive: false });
canvas.addEventListener("mousedown", handleStart);
canvas.addEventListener("mouseup", handleEnd);

function handleStart(event) {
  event.preventDefault();
  if (phase == "waiting") {
      lastTimestamp = undefined;
      introductionElement.style.opacity = 0;
      phase = "stretching";
      playSound(stretchSound);
      window.requestAnimationFrame(animate);
      if (!isMuted) backgroundMusic.play().catch(error => console.log("Background music play error:", error)); // Play music on first interaction
  }
}

function handleEnd(event) {
  event.preventDefault();
  if (phase == "stretching") {
      phase = "turning";
  }
}

window.addEventListener("keydown", function (event) {
  if (event.key == " ") {
      event.preventDefault();
      resetGame();
      return;
  }
});

window.addEventListener("resize", function (event) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw();
});

window.requestAnimationFrame(animate);

function animate(timestamp) {
  if (!lastTimestamp) {
      lastTimestamp = timestamp;
      window.requestAnimationFrame(animate);
      return;
  }

  // Animate clouds, birds, and stars continuously
  clouds.forEach((cloud, index) => {
      cloud.x -= cloud.speed * (timestamp - lastTimestamp) / 16;
      if (cloud.x < -100) {
          clouds.splice(index, 1);
          generateCloud();
      }
  });

  birds.forEach((bird, index) => {
      bird.x += bird.speed * bird.direction * (timestamp - lastTimestamp) / 16;
      bird.y += Math.sin(bird.x * 0.05) * 0.5;
      if (bird.x < -50 || bird.x > window.innerWidth + 50) {
          birds.splice(index, 1);
          generateBird();
      }
  });

  stars.forEach((star, index) => {
      star.x -= 0.5 * (timestamp - lastTimestamp) / 16; // Stars move slowly left
      if (star.x < -20) {
          stars.splice(index, 1);
          generateStar();
      }

      // Check for star collision with hero
      const heroLeft = heroX - heroWidth / 2;
      const heroRight = heroX + heroWidth / 2;
      const heroTop = heroY + canvasHeight - platformHeight - heroHeight / 2;
      const heroBottom = heroY + canvasHeight - platformHeight + heroHeight / 2;

      if (
          star.x >= heroLeft && star.x <= heroRight &&
          star.y >= heroTop && star.y <= heroBottom
      ) {
          score += star.value;
          scoreElement.innerText = score;
          playSound(starSound);
          stars.splice(index, 1);
          generateStar();
      }
  });

  // Change weather every 10 seconds
  if (timestamp - lastTimestamp > 10000) {
      weather = ["sunshine", "rain", "fog"][Math.floor(Math.random() * 3)];
  }

  // Change time of day based on score
  if (score > 50 && timeOfDay === "day") timeOfDay = "night";
  if (score > 100 && timeOfDay === "night") timeOfDay = "autumn";

  // Game phase logic
  switch (phase) {
      case "waiting": {
          break;
      }
      case "stretching": {
          sticks.last().length += (timestamp - lastTimestamp) / stretchingSpeed;
          break;
      }
      case "turning": {
          sticks.last().rotation += (timestamp - lastTimestamp) / turningSpeed;
          if (sticks.last().rotation > 90) {
              sticks.last().rotation = 90;
              const [nextPlatform, perfectHit] = thePlatformTheStickHits();
              if (nextPlatform) {
                  score += perfectHit ? 2 : 1;
                  playSound(landSound);
                  scoreElement.innerText = score;
                  if (perfectHit) {
                      perfectElement.style.opacity = 1;
                      setTimeout(() => (perfectElement.style.opacity = 0), 1000);
                  }
                  if (nextPlatform.powerUp) {
                      applyPowerUp(nextPlatform.powerUp);
                      nextPlatform.powerUp = null;
                  }
                  generatePlatform();
                  generateTree();
                  generateTree();
                  generateBird();
                  generateStar();
              }
              phase = "walking";
          }
          break;
      }
      case "walking": {
          heroX += (timestamp - lastTimestamp) / walkingSpeed;
          const [nextPlatform] = thePlatformTheStickHits();
          if (nextPlatform) {
              const maxHeroX = nextPlatform.x + nextPlatform.w - heroDistanceFromEdge;
              if (heroX > maxHeroX) {
                  heroX = maxHeroX;
                  phase = "transitioning";
              }
          } else {
              const maxHeroX = sticks.last().x + sticks.last().length + heroWidth;
              if (heroX > maxHeroX) {
                  heroX = maxHeroX;
                  phase = "falling";
              }
          }
          break;
      }
      case "transitioning": {
          sceneOffset += (timestamp - lastTimestamp) / transitioningSpeed;
          const [nextPlatform] = thePlatformTheStickHits();
          if (sceneOffset > nextPlatform.x + nextPlatform.w - paddingX) {
              sticks.push({
                  x: nextPlatform.x + nextPlatform.w,
                  length: 0,
                  rotation: 0
              });
              phase = "waiting";
          }
          break;
      }
      case "falling": {
          if (sticks.last().rotation < 180)
              sticks.last().rotation += (timestamp - lastTimestamp) / turningSpeed;
          heroY += (timestamp - lastTimestamp) / (weather === "rain" ? fallingSpeed * 1.2 : fallingSpeed);
          const maxHeroY = platformHeight + 100 + (window.innerHeight - canvasHeight) / 2;
          if (heroY > maxHeroY) {
              if (hasShield) {
                  playSound(landSound);
                  heroY = 0;
                  heroX = sticks.last().x + sticks.last().length - heroDistanceFromEdge; // Reset to last platform
                  phase = "waiting";
                  hasShield = false;
                  activePowerUps = activePowerUps.filter(p => p !== "shield"); // Remove shield from active power-ups
                  updatePowerUpUI();
              } else if (!gameOver) { // Only proceed if game hasn't ended yet
                  gameOver = true; // Set game-over flag to prevent duplicate calls
                  playSound(fallSound);
                  restartButton.style.display = "block";
                  showLeaderboard(); // Show leaderboard once
                  return;
              }
          }
          break;
      }
      default:
          throw Error("Wrong phase");
  }

  draw(timestamp);
  window.requestAnimationFrame(animate);
  lastTimestamp = timestamp;
}

function thePlatformTheStickHits() {
  const stick = sticks.last();

  // Handle shield activation before checking rotation
  if (hasShield && (phase === "turning" || phase === "falling")) {
      if (!platforms.some(platform => platform.x < stick.x + stick.length && stick.x + stick.length < platform.x + platform.w)) {
          // Reset stick and hero without changing rotation to avoid invalid state
          stick.length = 0; // Reset length only, keep rotation as is
          heroX = stick.x - heroDistanceFromEdge; // Move hero back to start of stick
          phase = "waiting"; // Return to waiting state
          hasShield = false;
          activePowerUps = activePowerUps.filter(p => p !== "shield"); // Remove shield
          playSound(landSound); // Play landing sound for shield save
          updatePowerUpUI();
          return [undefined, false];
      }
  }

  // Only check rotation if no shield is active or we're not in a shielded fall
  if (stick.rotation != 90 && !hasShield) {
      throw Error(`Stick is ${stick.rotation}°`);
  }

  const stickFarX = stick.x + stick.length;

  const platformTheStickHits = platforms.find(
      (platform) => platform.x < stickFarX && stickFarX < platform.x + platform.w
  );

  if (!platformTheStickHits) return [undefined, false];

  const perfectHit =
      platformTheStickHits.x + platformTheStickHits.w / 2 - perfectAreaSize / 2 <
      stickFarX &&
      stickFarX <
      platformTheStickHits.x + platformTheStickHits.w / 2 + perfectAreaSize / 2;

  return [platformTheStickHits, perfectHit];
}

function draw(timestamp) {
  ctx.save();
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  drawBackground();

  ctx.translate(
      (window.innerWidth - canvasWidth) / 2 - sceneOffset,
      (window.innerHeight - canvasHeight) / 2
  );

  drawPlatforms();
  drawHero(timestamp);
  drawSticks();

  ctx.restore();
}

restartButton.addEventListener("click", function (event) {
  event.preventDefault();
  resetGame();
  restartButton.style.display = "none";
  leaderboardElement.style.display = "none";
  gameOver = false; // Reset game-over flag on restart
});

muteButton.addEventListener("click", function () {
  isMuted = !isMuted;
  if (isMuted) {
      backgroundMusic.pause();
      muteButton.textContent = "Unmute Music";
  } else {
      backgroundMusic.play().catch(error => console.log("Background music play error:", error));
  }
});

function drawPlatforms() {
  platforms.forEach(({ x, w, powerUp }, index) => {
      const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEEAD"];
      let platformColor = colors[index % colors.length] || "#FF6B6B"; // Default to a valid color if undefined

      // Ensure platformColor is a valid hex or RGB string
      if (!platformColor.startsWith('#') && !platformColor.startsWith('rgb')) {
          platformColor = "#FF6B6B"; // Fallback to a safe hex color
      }

      // Apply weather effects with validation
      if (weather === "rain") {
          platformColor = darkenColor(platformColor, 0.8); // Wetter look, ensure valid RGB
      } else if (weather === "fog") {
          platformColor = "rgba(200, 200, 200, 0.7)"; // Foggy look, ensure valid RGBA
      }

      // Validate platformColor before using in gradient
      if (!isValidColor(platformColor)) {
          console.warn("Invalid color detected, falling back to default:", platformColor);
          platformColor = "#FF6B6B"; // Fallback to a safe hex color
      }

      try {
          const gradient = ctx.createLinearGradient(x, canvasHeight - platformHeight, x, canvasHeight);
          gradient.addColorStop(0, platformColor);
          gradient.addColorStop(1, darkenColor(platformColor, 0.7));
          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvasHeight - platformHeight, w, platformHeight + (window.innerHeight - canvasHeight) / 2);
      } catch (e) {
          console.error("Gradient error:", e);
          ctx.fillStyle = "#FF6B6B"; // Fallback color if gradient fails
          ctx.fillRect(x, canvasHeight - platformHeight, w, platformHeight + (window.innerHeight - canvasHeight) / 2);
      }

      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.fillRect(x, canvasHeight - platformHeight, w, 2);

      ctx.fillStyle = contrastColor(platformColor);
      for (let i = x + 5; i < x + w - 5; i += 15) {
          ctx.beginPath();
          ctx.arc(i, canvasHeight - platformHeight + 5, 2, 0, Math.PI * 2);
          ctx.fill();
      }

      if (powerUp) {
          ctx.fillStyle = "black"; // Set fill style for text/icon
          ctx.font = "20px Arial"; // Set font size and type for emojis
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          let powerUpIcon;
          switch (powerUp) {
              case "shield":
                  powerUpIcon = "🛡️"; // Shield emoji for shield power-up
                  break;
              case "speedBoost":
                  powerUpIcon = "⚡"; // Lightning bolt for speed boost
                  break;
              case "doubleScore":
                  powerUpIcon = "⭐"; // Star for double score
                  break;
              default:
                  powerUpIcon = "★"; // Default icon (star) if powerUp is invalid
          }

          ctx.fillText(powerUpIcon, x + w / 2, canvasHeight - platformHeight - 10); // Draw emoji at the center of the platform, above it
      }

      if (sticks.last().x < x) {
          ctx.fillStyle = "#FFD700";
          ctx.fillRect(x + w / 2 - perfectAreaSize / 2, canvasHeight - platformHeight, perfectAreaSize, perfectAreaSize);
          ctx.fillStyle = "rgba(255, 215, 0, 0.4)";
          ctx.fillRect(x + w / 2 - perfectAreaSize / 1.5, canvasHeight - platformHeight - 2, perfectAreaSize * 1.5, perfectAreaSize + 4);
      }
  });
}

function darkenColor(hex, factor) {
  // Ensure hex is valid, handle both hex and RGB inputs
  let r, g, b;
  if (hex.startsWith('#')) {
      r = parseInt(hex.slice(1, 3), 16) * factor;
      g = parseInt(hex.slice(3, 5), 16) * factor;
      b = parseInt(hex.slice(5, 7), 16) * factor;
  } else if (hex.startsWith('rgb') || hex.startsWith('rgba')) {
      const matches = hex.match(/\d+/g);
      if (matches && matches.length >= 3) {
          r = parseInt(matches[0]) * factor;
          g = parseInt(matches[1]) * factor;
          b = parseInt(matches[2]) * factor;
      } else {
          return "#FF6B6B"; // Fallback to safe hex if RGB parsing fails
      }
  } else {
      return "#FF6B6B"; // Fallback to safe hex if format is unrecognized
  }
  return `rgb(${Math.floor(Math.max(0, Math.min(255, r)))}, ${Math.floor(Math.max(0, Math.min(255, g)))}, ${Math.floor(Math.max(0, Math.min(255, b)))})`;
}

function contrastColor(hex) {
  let r, g, b;
  if (hex.startsWith('#')) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
  } else if (hex.startsWith('rgb') || hex.startsWith('rgba')) {
      const matches = hex.match(/\d+/g);
      if (matches && matches.length >= 3) {
          r = parseInt(matches[0]);
          g = parseInt(matches[1]);
          b = parseInt(matches[2]);
      } else {
          return "#FFFFFF"; // Fallback to white if RGB parsing fails
      }
  } else {
      return "#FFFFFF"; // Fallback to white if format is unrecognized
  }
  let luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#333333" : "#FFFFFF";
}

function isValidColor(color) {
  if (!color) return false;
  if (color.startsWith('#')) {
      return /^#[0-9A-Fa-f]{6}$/.test(color);
  } else if (color.startsWith('rgb') || color.startsWith('rgba')) {
      return /^rgba?\(\d{1,3},\s*\d{1,3},\s*\d{1,3}(,\s*(0?\.\d+|1(\.0)?|0))?\)$/.test(color);
  }
  return false;
}

let animationFrame = 0;
function drawHero(timestamp) {
  ctx.save();
  ctx.translate(heroX - heroWidth / 2, heroY + canvasHeight - platformHeight - heroHeight / 2);

  if (timestamp && lastTimestamp) {
      animationFrame = (animationFrame + (timestamp - lastTimestamp) / 50) % 360;
  }

  ctx.fillStyle = "#FF8C00"; // Orange
  drawRoundedRect(-heroWidth / 2, -heroHeight / 2 + 8, heroWidth, heroHeight - 15, 5);

  ctx.fillStyle = "#FFA500"; // Light orange
  ctx.beginPath();
  ctx.arc(0, -heroHeight / 2 + 8, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.moveTo(-4, -heroHeight / 2 + 2);
  ctx.lineTo(-8, -heroHeight / 2 + 8);
  ctx.lineTo(-4, -heroHeight / 2 + 8);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(4, -heroHeight / 2 + 2);
  ctx.lineTo(8, -heroHeight / 2 + 8);
  ctx.lineTo(4, -heroHeight / 2 + 8);
  ctx.fill();

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(-3, -heroHeight / 2 + 6, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(3, -heroHeight / 2 + 6, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(-3, -heroHeight / 2 + 6, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(3, -heroHeight / 2 + 6, 1, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(0, -heroHeight / 2 + 8, 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#FF0000"; // Red
  ctx.beginPath();
  ctx.moveTo(-heroWidth / 2 - 2, -heroHeight / 2 + 2);
  ctx.lineTo(heroWidth / 2 + 2, -heroHeight / 2 + 2);
  ctx.lineTo(heroWidth / 2 + 5, -heroHeight / 2 - 2);
  ctx.lineTo(-heroWidth / 2 - 5, -heroHeight / 2 - 2);
  ctx.fill();

  ctx.fillStyle = "#FF8C00";
  ctx.beginPath();
  ctx.moveTo(-heroWidth / 2 - 5, -heroHeight / 2 + 10);
  ctx.quadraticCurveTo(-heroWidth / 2 - 15, -heroHeight / 2, -heroWidth / 2 - 10, -heroHeight / 2 + 15);
  ctx.fill();
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(-heroWidth / 2 - 10, -heroHeight / 2 + 15, 2, 0, Math.PI * 2);
  ctx.fill();

  if (lastTimestamp) {
      switch (phase) {
          case "waiting": {
              const bounce = Math.sin(animationFrame) * 2;
              ctx.translate(0, bounce);
              ctx.fillStyle = "#FF8C00";
              ctx.beginPath();
              ctx.arc(5, 10, 3, 0, Math.PI * 2, false); // Right leg, visible
              ctx.fill();
              ctx.beginPath();
              ctx.arc(-5, 10, 3, 0, Math.PI * 2, false); // Left leg, visible
              ctx.fill();
              break;
          }
          case "stretching": {
              ctx.fillStyle = "#FF8C00";
              ctx.fillRect(heroWidth / 2, 5, 8 + Math.sin(animationFrame) * 3, 3); // Right paw extends
              ctx.beginPath();
              ctx.arc(5, 10, 3, 0, Math.PI * 2, false); // Right leg
              ctx.fill();
              ctx.beginPath();
              ctx.arc(-5, 10, 3, 0, Math.PI * 2, false); // Left leg
              ctx.fill();
              break;
          }
          case "turning": {
              ctx.rotate(Math.sin(animationFrame) * 0.05);
              ctx.fillStyle = "#FF8C00";
              ctx.beginPath();
              ctx.arc(5, 10, 3, 0, Math.PI * 2, false); // Right leg
              ctx.fill();
              ctx.beginPath();
              ctx.arc(-5, 10, 3, 0, Math.PI * 2, false); // Left leg
              ctx.fill();
              break;
          }
          case "walking": {
              const legSwing = Math.sin(animationFrame * 2) * 3;
              ctx.fillStyle = "#FF8C00";
              ctx.beginPath();
              ctx.arc(5 + legSwing, 10, 3, 0, Math.PI * 2, false); // Right leg moves
              ctx.fill();
              ctx.beginPath();
              ctx.arc(-5 - legSwing, 10, 3, 0, Math.PI * 2, false); // Left leg moves opposite
              ctx.fill();
              break;
          }
          case "falling": {
              const stickRotation = sticks.length > 0 ? sticks.last().rotation : 90;
              ctx.rotate((stickRotation - 90) * (Math.PI / 180) * 0.5);
              ctx.fillStyle = "#FF8C00";
              ctx.fillRect(-heroWidth / 2 - 8, 5 + Math.sin(animationFrame) * 5, 8, 3); // Left paw waves
              ctx.fillRect(heroWidth / 2, 5 - Math.sin(animationFrame) * 5, 8, 3); // Right paw waves
              ctx.beginPath();
              ctx.arc(5, 10, 3, 0, Math.PI * 2, false); // Right leg
              ctx.fill();
              ctx.beginPath();
              ctx.arc(-5, 10, 3, 0, Math.PI * 2, false); // Left leg
              ctx.fill();
              break;
          }
          default: {
              ctx.fillStyle = "#FF8C00";
              ctx.beginPath();
              ctx.arc(5, 10, 3, 0, Math.PI * 2, false); // Right leg
              ctx.fill();
              ctx.beginPath();
              ctx.arc(-5, 10, 3, 0, Math.PI * 2, false); // Left leg
              ctx.fill();
          }
      }
  } else {
      ctx.fillStyle = "#FF8C00";
      ctx.beginPath();
      ctx.arc(5, 10, 3, 0, Math.PI * 2, false); // Right leg
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-5, 10, 3, 0, Math.PI * 2, false); // Left leg
      ctx.fill();
  }

  ctx.restore();
}

function drawRoundedRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x, y + radius);
  ctx.lineTo(x, y + height - radius);
  ctx.arcTo(x, y + height, x + radius, y + height, radius);
  ctx.lineTo(x + width - radius, y + height);
  ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
  ctx.lineTo(x + width, y + radius);
  ctx.arcTo(x + width, y, x + width - radius, y, radius);
  ctx.lineTo(x + radius, y);
  ctx.arcTo(x, y, x, y + radius, radius);
  ctx.fill();
}

function drawSticks() {
  sticks.forEach((stick) => {
      ctx.save();
      ctx.translate(stick.x, canvasHeight - platformHeight);
      ctx.rotate((Math.PI / 180) * stick.rotation);

      const ladderWidth = 10;
      const rungSpacing = 10;
      const rungCount = Math.floor(stick.length / rungSpacing);

      const gradient = ctx.createLinearGradient(0, 0, 0, -stick.length);
      gradient.addColorStop(0, "#8B4513");
      gradient.addColorStop(1, "#D2691E");
      ctx.fillStyle = gradient;

      ctx.fillRect(-ladderWidth / 2, -stick.length, 2, stick.length);
      ctx.fillRect(ladderWidth / 2 - 2, -stick.length, 2, stick.length);

      ctx.fillStyle = "#CD853F";
      for (let i = 0; i < rungCount; i++) {
          let yPos = -rungSpacing * (i + 0.5);
          ctx.fillRect(-ladderWidth / 2, yPos - 1, ladderWidth, 2);
          ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
          ctx.fillRect(-ladderWidth / 2, yPos + 1, ladderWidth, 1);
          ctx.fillStyle = "#CD853F";
      }

      ctx.strokeStyle = "#228B22";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-ladderWidth / 2 + 1, 0);
      for (let i = 0; i < stick.length; i += 5) {
          ctx.lineTo(-ladderWidth / 2 + 1 + Math.sin(i * 0.1) * 2, -i);
      }
      ctx.stroke();

      ctx.restore();
  });
}

function drawBackground() {
  let skyColors;
  switch (timeOfDay) {
      case "day":
          skyColors = { top: "#1E90FF", mid1: "#87CEEB", mid2: "#FFD700", bottom1: "#FFFACD", bottom2: "#FFF8E7" };
          break;
      case "night":
          skyColors = { top: "#00008B", mid1: "#000066", mid2: "#000033", bottom1: "#000000", bottom2: "#1A1A1A" };
          break;
      case "autumn":
          skyColors = { top: "#FF4500", mid1: "#FFA500", mid2: "#FFD700", bottom1: "#F4A460", bottom2: "#DAA520" };
          break;
  }

  var gradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
  gradient.addColorStop(0, skyColors.top);
  gradient.addColorStop(0.2, skyColors.mid1);
  gradient.addColorStop(0.4, skyColors.mid2);
  gradient.addColorStop(0.7, skyColors.bottom1);
  gradient.addColorStop(1, skyColors.bottom2);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  // Draw stars for night
  if (timeOfDay === "night") {
      ctx.fillStyle = "white";
      for (let i = 0; i < 50; i++) {
          ctx.beginPath();
          ctx.arc(Math.random() * window.innerWidth, Math.random() * (window.innerHeight * 0.3), 1, 0, Math.PI * 2);
          ctx.fill();
      }
  }

  // Weather effects
  if (weather === "rain") {
      ctx.fillStyle = "rgba(0, 0, 255, 0.2)";
      for (let i = 0; i < 100; i++) {
          const rainX = Math.random() * window.innerWidth;
          const rainY = Math.random() * window.innerHeight;
          ctx.fillRect(rainX, rainY, 2, 10);
      }
  } else if (weather === "fog") {
      ctx.fillStyle = "rgba(200, 200, 200, 0.5)";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  }

  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  clouds.forEach((cloud) => {
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, 20, 0, Math.PI * 2);
      ctx.arc(cloud.x + 30, cloud.y - 10, 25, 0, Math.PI * 2);
      ctx.arc(cloud.x + 60, cloud.y, 20, 0, Math.PI * 2);
      ctx.fill();
  });

  let hill1Color, hill2Color;
  switch (timeOfDay) {
      case "day":
          hill1Color = "#4A7043"; hill2Color = "#2E4A29";
          break;
      case "night":
          hill1Color = "#1A2E1A"; hill2Color = "#0F1A0F";
          break;
      case "autumn":
          hill1Color = "#8B4513"; hill2Color = "#6B4E31";
          break;
  }
  drawHill(hill1BaseHeight, hill1Amplitude, hill1Stretch, hill1Color);
  drawHill(hill2BaseHeight, hill2Amplitude, hill2Stretch, hill2Color);

  let treeColors = ["#6D8821", "#8FAC34", "#98B333"];
  if (timeOfDay === "autumn") treeColors = ["#DAA520", "#F4A460", "#FF8C00"];
  if (timeOfDay === "night") treeColors = ["#2E4A29", "#3A5F3A", "#466F46"];
  trees.forEach((tree) => drawTree(tree.x, treeColors[Math.floor(Math.random() * 3)]));

  birds.forEach((bird) => {
      ctx.fillStyle = "#444444";
      ctx.beginPath();
      ctx.moveTo(bird.x, bird.y);
      ctx.lineTo(bird.x + (bird.direction * 10), bird.y - 5);
      ctx.lineTo(bird.x + (bird.direction * 10), bird.y + 5);
      ctx.fill();
  });

  // Draw stars
  stars.forEach((star) => {
      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.moveTo(star.x, star.y - 5);
      ctx.lineTo(star.x + 5, star.y + 5);
      ctx.lineTo(star.x - 5, star.y + 5);
      ctx.fill();
  });
}

function drawHill(baseHeight, amplitude, stretch, color) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, window.innerHeight);
  ctx.lineTo(0, getHillY(0, baseHeight, amplitude, stretch));
  for (let i = 0; i < window.innerWidth; i += 5) {
      let y = getHillY(i, baseHeight, amplitude, stretch);
      y += Math.sin(i * 0.05) * 3 + (Math.random() - 0.5) * 4;
      ctx.lineTo(i, y);
  }
  ctx.lineTo(window.innerWidth, window.innerHeight);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(0, window.innerHeight);
  ctx.lineTo(0, getHillY(0, baseHeight, amplitude, stretch) + 10);
  for (let i = 0; i < window.innerWidth; i += 5) {
      let y = getHillY(i, baseHeight, amplitude, stretch) + 10;
      y += Math.sin(i * 0.05) * 2;
      ctx.lineTo(i, y);
  }
  ctx.lineTo(window.innerWidth, window.innerHeight);
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.fill();
  ctx.restore();
}

function drawTree(x, color) {
  ctx.save();
  ctx.translate((-sceneOffset * backgroundSpeedMultiplier + x) * hill1Stretch, getTreeY(x, hill1BaseHeight, hill1Amplitude));

  const treeTrunkHeight = 6;
  const treeTrunkWidth = 3;
  const treeCrownHeight = 20;
  const treeCrownWidth = 15;

  ctx.fillStyle = "#6B4E31";
  if (timeOfDay === "night") ctx.fillStyle = "#3A2F2A"; // Darker trunk at night
  if (timeOfDay === "autumn") ctx.fillStyle = "#8B4513"; // Brown trunk in autumn
  ctx.fillRect(-treeTrunkWidth / 2, -treeTrunkHeight, treeTrunkWidth, treeTrunkHeight);

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, -treeTrunkHeight, treeCrownWidth / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -(treeTrunkHeight + treeCrownHeight * 0.4), treeCrownWidth * 0.7 / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -(treeTrunkHeight + treeCrownHeight * 0.7), treeCrownWidth * 0.4 / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function getHillY(windowX, baseHeight, amplitude, stretch) {
  const sineBaseY = window.innerHeight - baseHeight;
  return Math.sinus((sceneOffset * backgroundSpeedMultiplier + windowX) * stretch) * amplitude + sineBaseY;
}

function getTreeY(x, baseHeight, amplitude) {
  const sineBaseY = window.innerHeight - baseHeight;
  return Math.sinus(x) * amplitude + sineBaseY;
}

function applyPowerUp(powerUp) {
  switch (powerUp) {
      case "speedBoost":
          walkingSpeed = walkingSpeed * 1.5; // Use assignment to ensure mutability
          activePowerUps.push("speedBoost");
          setTimeout(() => {
              walkingSpeed = walkingSpeed / 1.5;
              activePowerUps = activePowerUps.filter(p => p !== "speedBoost");
              updatePowerUpUI();
          }, 5000);
          break;
      case "doubleScore":
          score = score * 2; // Use assignment for consistency
          scoreElement.innerText = score;
          activePowerUps.push("doubleScore");
          setTimeout(() => {
              activePowerUps = activePowerUps.filter(p => p !== "doubleScore");
              updatePowerUpUI();
          }, 5000); // Double score lasts 5 seconds
          break;
      case "shield":
          hasShield = true;
          activePowerUps.push("shield");
          updatePowerUpUI();
          break;
  }
  updatePowerUpUI();
}

function updatePowerUpUI() {
  if (!powerUpElement) {
      powerUpElement = document.getElementById("powerUp");
  }
  powerUpElement.innerHTML = ""; // Clear existing icons

  activePowerUps.forEach(powerUp => {
      let icon;
      switch (powerUp) {
          case "speedBoost":
              icon = "⚡"; // Lightning bolt for speed boost
              break;
          case "doubleScore":
              icon = "⭐"; // Star for double score
              break;
          case "shield":
              icon = "🛡️"; // Shield emoji
              break;
      }
      if (icon) {
          const span = document.createElement("span");
          span.textContent = icon;
          powerUpElement.appendChild(span);
      }
  });

  // Show or hide power-up container based on active power-ups
  powerUpElement.style.display = activePowerUps.length > 0 ? "flex" : "none";

  // Always show shield indicator if shield is active
  shieldIndicator.style.display = hasShield ? "block" : "none";
}

function showLeaderboard() {
  if (!gameOver) return; // Prevent duplicate calls if gameOver is not set
  leaderboardElement.style.display = "block";
  const scores = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  scores.push(score);
  scores.sort((a, b) => b - a).slice(0, 5); // Top 5 scores
  localStorage.setItem("leaderboard", JSON.stringify(scores));
  leaderboardList.innerHTML = scores.map((s, i) => `<li>${i + 1}. ${s}</li>`).join("");
}