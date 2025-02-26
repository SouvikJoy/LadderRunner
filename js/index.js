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
  
  let score = 0;
  
  // Configuration
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
  const walkingSpeed = 4;
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
  const scoreElement = document.getElementById("score");
  
  // Initialize layout
  resetGame();
  
  function resetGame() {
    phase = "waiting";
    lastTimestamp = undefined;
    sceneOffset = 0;
    score = 0;
  
    introductionElement.style.opacity = 1;
    perfectElement.style.opacity = 0;
    restartButton.style.display = "none";
    scoreElement.innerText = score;
  
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
  
    heroX = platforms[0].x + platforms[0].w - heroDistanceFromEdge;
    heroY = 0;
  
    draw();
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
    let furthestX = lastPlatform.x + lastPlatform.w;
  
    const x = furthestX + minimumGap + Math.floor(Math.random() * (maximumGap - minimumGap));
    const w = minimumWidth + Math.floor(Math.random() * (maximumWidth - minimumWidth));
  
    platforms.push({ x, w });
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
  
  window.addEventListener("keydown", function (event) {
    if (event.key == " ") {
      event.preventDefault();
      resetGame();
      return;
    }
  });
  
  window.addEventListener("mousedown", function (event) {
    if (phase == "waiting") {
      lastTimestamp = undefined;
      introductionElement.style.opacity = 0;
      phase = "stretching";
      window.requestAnimationFrame(animate);
    }
  });
  
  window.addEventListener("mouseup", function (event) {
    if (phase == "stretching") {
      phase = "turning";
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
  
    // Animate clouds and birds continuously, regardless of phase
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
  
    // Game phase logic
    switch (phase) {
      case "waiting": {
        // No return here, let the loop continue for background animations
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
            scoreElement.innerText = score;
            if (perfectHit) {
              perfectElement.style.opacity = 1;
              setTimeout(() => (perfectElement.style.opacity = 0), 1000);
            }
            generatePlatform();
            generateTree();
            generateTree();
            generateBird();
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
        heroY += (timestamp - lastTimestamp) / fallingSpeed;
        const maxHeroY = platformHeight + 100 + (window.innerHeight - canvasHeight) / 2;
        if (heroY > maxHeroY) {
          restartButton.style.display = "block";
          return;
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
    if (sticks.last().rotation != 90)
      throw Error(`Stick is ${sticks.last().rotation}°`);
    const stickFarX = sticks.last().x + sticks.last().length;
  
    const platformTheStickHits = platforms.find(
      (platform) => platform.x < stickFarX && stickFarX < platform.x + platform.w
    );
  
    if (
      platformTheStickHits &&
      platformTheStickHits.x + platformTheStickHits.w / 2 - perfectAreaSize / 2 <
        stickFarX &&
      stickFarX <
        platformTheStickHits.x + platformTheStickHits.w / 2 + perfectAreaSize / 2
    )
      return [platformTheStickHits, true];
  
    return [platformTheStickHits, false];
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
  });
  
  function drawPlatforms() {
    platforms.forEach(({ x, w }, index) => {
      const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEEAD"];
      const platformColor = colors[index % colors.length];
      const gradient = ctx.createLinearGradient(x, canvasHeight - platformHeight, x, canvasHeight);
      gradient.addColorStop(0, platformColor);
      gradient.addColorStop(1, darkenColor(platformColor, 0.7));
      ctx.fillStyle = gradient;
      ctx.fillRect(x, canvasHeight - platformHeight, w, platformHeight + (window.innerHeight - canvasHeight) / 2);
  
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.fillRect(x, canvasHeight - platformHeight, w, 2);
  
      ctx.fillStyle = contrastColor(platformColor);
      for (let i = x + 5; i < x + w - 5; i += 15) {
        ctx.beginPath();
        ctx.arc(i, canvasHeight - platformHeight + 5, 2, 0, Math.PI * 2);
        ctx.fill();
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
    let r = parseInt(hex.slice(1, 3), 16) * factor;
    let g = parseInt(hex.slice(3, 5), 16) * factor;
    let b = parseInt(hex.slice(5, 7), 16) * factor;
    return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
  }
  
  function contrastColor(hex) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    let luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#333333" : "#FFFFFF";
  }
  
  let animationFrame = 0;
  function drawHero(timestamp) {
    ctx.save();
    ctx.translate(heroX - heroWidth / 2, heroY + canvasHeight - platformHeight - heroHeight / 2);
  
    if (timestamp && lastTimestamp) {
      animationFrame = (animationFrame + (timestamp - lastTimestamp) / 50) % 360;
    }
  
    ctx.fillStyle = "black";
    drawRoundedRect(-heroWidth / 2, -heroHeight / 2, heroWidth, heroHeight - 4, 5);
  
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(5, -7, 3, 0, Math.PI * 2, false);
    ctx.fill();
  
    ctx.fillStyle = "red";
    ctx.fillRect(-heroWidth / 2 - 1, -12, heroWidth + 2, 4.5);
    ctx.beginPath();
    ctx.moveTo(-9, -14.5);
    ctx.lineTo(-17, -18.5);
    ctx.lineTo(-14, -8.5);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-10, -10.5);
    ctx.lineTo(-15, -3.5);
    ctx.lineTo(-5, -7);
    ctx.fill();
  
    if (lastTimestamp) {
      switch (phase) {
        case "waiting": {
          const bounce = Math.sin(animationFrame) * 2;
          ctx.translate(0, bounce);
          const legDistance = 5;
          ctx.fillStyle = "black";
          ctx.beginPath();
          ctx.arc(legDistance, 11.5, 3, 0, Math.PI * 2, false);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(-legDistance, 11.5, 3, 0, Math.PI * 2, false);
          ctx.fill();
          break;
        }
        case "stretching": {
          ctx.fillStyle = "black";
          ctx.fillRect(heroWidth / 2, -5, 8 + Math.sin(animationFrame) * 3, 3);
          const legDistance = 5;
          ctx.beginPath();
          ctx.arc(legDistance, 11.5, 3, 0, Math.PI * 2, false);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(-legDistance, 11.5, 3, 0, Math.PI * 2, false);
          ctx.fill();
          break;
        }
        case "turning": {
          ctx.rotate(Math.sin(animationFrame) * 0.05);
          const legDistance = 5;
          ctx.fillStyle = "black";
          ctx.beginPath();
          ctx.arc(legDistance, 11.5, 3, 0, Math.PI * 2, false);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(-legDistance, 11.5, 3, 0, Math.PI * 2, false);
          ctx.fill();
          break;
        }
        case "walking": {
          const legSwing = Math.sin(animationFrame * 2) * 3;
          ctx.fillStyle = "black";
          ctx.beginPath();
          ctx.arc(5 + legSwing, 11.5, 3, 0, Math.PI * 2, false);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(-5 - legSwing, 11.5, 3, 0, Math.PI * 2, false);
          ctx.fill();
          break;
        }
        case "falling": {
          const stickRotation = sticks.length > 0 ? sticks.last().rotation : 90;
          ctx.rotate((stickRotation - 90) * (Math.PI / 180) * 0.5);
          ctx.fillStyle = "black";
          ctx.fillRect(-heroWidth / 2 - 8, -10 + Math.sin(animationFrame) * 5, 8, 3);
          ctx.fillRect(heroWidth / 2, -10 - Math.sin(animationFrame) * 5, 8, 3);
          ctx.beginPath();
          ctx.arc(5, 11.5, 3, 0, Math.PI * 2, false);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(-5, 11.5, 3, 0, Math.PI * 2, false);
          ctx.fill();
          break;
        }
        default: {
          const legDistance = 5;
          ctx.fillStyle = "black";
          ctx.beginPath();
          ctx.arc(legDistance, 11.5, 3, 0, Math.PI * 2, false);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(-legDistance, 11.5, 3, 0, Math.PI * 2, false);
          ctx.fill();
        }
      }
    } else {
      const legDistance = 5;
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(legDistance, 11.5, 3, 0, Math.PI * 2, false);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-legDistance, 11.5, 3, 0, Math.PI * 2, false);
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
    var gradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
    gradient.addColorStop(0, "#1E90FF");
    gradient.addColorStop(0.2, "#87CEEB");
    gradient.addColorStop(0.4, "#FFD700");
    gradient.addColorStop(0.7, "#FFFACD");
    gradient.addColorStop(1, "#FFF8E7");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    clouds.forEach((cloud) => {
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, 20, 0, Math.PI * 2);
      ctx.arc(cloud.x + 30, cloud.y - 10, 25, 0, Math.PI * 2);
      ctx.arc(cloud.x + 60, cloud.y, 20, 0, Math.PI * 2);
      ctx.fill();
    });
  
    drawHill(hill1BaseHeight, hill1Amplitude, hill1Stretch, "#4A7043");
    drawHill(hill2BaseHeight, hill2Amplitude, hill2Stretch, "#2E4A29");
  
    trees.forEach((tree) => drawTree(tree.x, tree.color));
  
    birds.forEach((bird) => {
      ctx.fillStyle = "#444444";
      ctx.beginPath();
      ctx.moveTo(bird.x, bird.y);
      ctx.lineTo(bird.x + (bird.direction * 10), bird.y - 5);
      ctx.lineTo(bird.x + (bird.direction * 10), bird.y + 5);
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