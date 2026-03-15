import type { Block } from "../types/block";

export interface StarterTemplate {
  id: string;
  titleKey: string;
  emoji: string;
  descriptionKey: string;
  blocks: Block[];
}

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: "catch-the-star",
    titleKey: "template_catch_star_title",
    emoji: "⭐",
    descriptionKey: "template_catch_star_desc",
    blocks: [
      {
        id: "catch-star-bg",
        type: "setup",
        label: "Background",
        emoji: "🎨",
        enabled: true,
        params: [
          {
            key: "bgColor",
            label: "Background Color",
            type: "color",
            value: "#1a1a2e",
          },
        ],
        code: `game.setBackground({{bgColor}});`,
        order: 0,
      },
      {
        id: "catch-star-score",
        type: "score",
        label: "Score Display",
        emoji: "⭐",
        enabled: true,
        params: [
          {
            key: "color",
            label: "Text Color",
            type: "color",
            value: "#ffe66d",
          },
        ],
        code: `game.set("score", 0);
game.addText("scoreText", "Score: 0", 10, 10, {
  font: "bold 24px sans-serif",
  color: {{color}},
  align: "left"
});`,
        order: 1,
      },
      {
        id: "catch-star-entity",
        type: "character",
        label: "Star Character",
        emoji: "⭐",
        enabled: true,
        params: [
          {
            key: "size",
            label: "Star Size",
            type: "number",
            value: 48,
            min: 20,
            max: 100,
            step: 4,
          },
        ],
        code: `var star = game.addEntity("star", {
  text: "⭐",
  x: Math.random() * (game.width() - {{size}}),
  y: Math.random() * (game.height() - {{size}}),
  width: {{size}},
  height: {{size}},
  fontSize: {{size}}
});
game.addText("tapHint", "Tap the star!", game.width() / 2, game.height() - 30, {
  font: "bold 20px sans-serif",
  color: "#ffe66d",
  align: "center"
});
game.onTap("catch-star-entity", function(x, y, entity) {
  if (!entity || entity._id !== "star") return;
  var score = game.get("score") + 1;
  game.set("score", score);
  game.updateText("scoreText", "Score: " + score);
  game.burst(star.x + {{size}}/2, star.y + {{size}}/2, { count: 12, spread: 4, colors: ["#FDE047", "#FBBF24", "#FB923C"], shape: "star", life: 30 });
  game.tween(star, { scaleX: 1.4, scaleY: 1.4 }, 100, { easing: "easeOut", onComplete: function() { game.tween(star, { scaleX: 1, scaleY: 1 }, 100); } });
  game.playTone(400 + score * 40, 120, { type: "sine", volume: 0.3 });
  game.shake(2, 100);
  star.x = Math.random() * (game.width() - {{size}});
  star.y = Math.random() * (game.height() - {{size}});
});`,
        order: 2,
      },
    ],
  },
  {
    id: "bouncing-emoji",
    titleKey: "template_bouncing_emoji_title",
    emoji: "🏀",
    descriptionKey: "template_bouncing_emoji_desc",
    blocks: [
      {
        id: "bounce-bg",
        type: "setup",
        label: "Background",
        emoji: "🎨",
        enabled: true,
        params: [
          {
            key: "bgColor",
            label: "Background Color",
            type: "color",
            value: "#4ecdc4",
          },
        ],
        code: `game.setBackground({{bgColor}});`,
        order: 0,
      },
      {
        id: "bounce-entity",
        type: "movement",
        label: "Bouncing Ball",
        emoji: "🏀",
        enabled: true,
        params: [
          {
            key: "speed",
            label: "Speed",
            type: "number",
            value: 4,
            min: 1,
            max: 10,
            step: 1,
          },
          {
            key: "size",
            label: "Size",
            type: "number",
            value: 60,
            min: 20,
            max: 120,
            step: 4,
          },
        ],
        code: `(function() {
  var ball = game.addEntity("ball", {
    text: "🏀",
    x: game.width() / 2,
    y: game.height() / 2,
    width: {{size}},
    height: {{size}},
    fontSize: {{size}},
    _vx: {{speed}},
    _vy: {{speed}}
  });
  game.onUpdate("bounce-update", function() {
    ball.x += ball._vx;
    ball.y += ball._vy;
    if (ball.x <= 0 || ball.x >= game.width() - {{size}}) ball._vx *= -1;
    if (ball.y <= 0 || ball.y >= game.height() - {{size}}) ball._vy *= -1;
    game.trail(ball.x + {{size}}/2, ball.y + {{size}}/2, { count: 1, color: "#FF6B9D", life: 10, size: 4 });
  });
  game.addText("tapHint", "Tap to burst!", game.width() / 2, game.height() - 30, {
    font: "bold 18px sans-serif",
    color: "#222",
    align: "center"
  });
  game.onTapAnywhere("bounce-tap", function(x, y) {
    game.burst(x, y, { count: 15, spread: 5, colors: ["#FF6B9D", "#FDE047", "#67E8F9"], shape: "circle", life: 25 });
    game.playTone(500 + Math.random() * 300, 100, { type: "triangle", volume: 0.3 });
    game.shake(3, 100);
  });
})();`,
        order: 1,
      },
    ],
  },
  {
    id: "color-mixer",
    titleKey: "template_color_mixer_title",
    emoji: "🎨",
    descriptionKey: "template_color_mixer_desc",
    blocks: [
      {
        id: "color-mixer-bg",
        type: "setup",
        label: "Background",
        emoji: "🎨",
        enabled: true,
        params: [
          {
            key: "bgColor",
            label: "Starting Color",
            type: "color",
            value: "#ffffff",
          },
        ],
        code: `game.setBackground({{bgColor}});`,
        order: 0,
      },
      {
        id: "color-mixer-buttons",
        type: "event",
        label: "Color Buttons",
        emoji: "🎨",
        enabled: true,
        params: [],
        code: `(function() {
  var colors = ["#ff6b6b", "#ffe66d", "#4ecdc4", "#a8e6cf", "#c3aed6", "#ffb86c"];
  var labels = ["RED", "YELLOW", "TEAL", "GREEN", "PURPLE", "ORANGE"];
  var cols = 3;
  var btnW = Math.floor(game.width() / cols) - 20;
  var btnH = 80;
  for (var i = 0; i < colors.length; i++) {
    (function(idx) {
      var col = idx % cols;
      var row = Math.floor(idx / cols);
      var btn = game.addEntity("btn-" + idx, {
        text: labels[idx],
        x: 10 + col * (btnW + 10),
        y: 60 + row * (btnH + 10),
        width: btnW,
        height: btnH,
        fontSize: 18,
        bgColor: colors[idx],
        borderColor: "#222",
        borderWidth: 3
      });
    })(i);
  }
  game.onTap("color-mixer-buttons", function(x, y, entity) {
    if (!entity || !entity._id) return;
    for (var j = 0; j < colors.length; j++) {
      if (entity._id === "btn-" + j) {
        game.setBackground(colors[j]);
        game.burst(x, y, { count: 10, spread: 4, color: colors[j], shape: "circle", life: 25 });
        game.tween(entity, { scaleX: 1.2, scaleY: 1.2 }, 100, { easing: "easeOut", onComplete: function() { game.tween(entity, { scaleX: 1, scaleY: 1 }, 100); } });
        game.playTone(300 + j * 80, 120, { type: "sine", volume: 0.3 });
        game.shake(2, 80);
        break;
      }
    }
  });
  game.addText("title", "Pick a Color!", game.width() / 2, 30, {
    font: "bold 28px sans-serif",
    color: "#222",
    align: "center"
  });
})();`,
        order: 1,
      },
    ],
  },
  {
    id: "counting-game",
    titleKey: "template_counting_game_title",
    emoji: "🔢",
    descriptionKey: "template_counting_game_desc",
    blocks: [
      {
        id: "counting-bg",
        type: "setup",
        label: "Background",
        emoji: "🎨",
        enabled: true,
        params: [
          {
            key: "bgColor",
            label: "Background Color",
            type: "color",
            value: "#fdfbf7",
          },
        ],
        code: `game.setBackground({{bgColor}});`,
        order: 0,
      },
      {
        id: "counting-display",
        type: "score",
        label: "Counter",
        emoji: "🔢",
        enabled: true,
        params: [
          {
            key: "color",
            label: "Number Color",
            type: "color",
            value: "#222222",
          },
          {
            key: "maxCount",
            label: "Count To",
            type: "number",
            value: 10,
            min: 5,
            max: 100,
            step: 5,
          },
        ],
        code: `(function() {
  game.set("count", 0);
  game.addText("countDisplay", "0", game.width() / 2, game.height() / 2 - 20, {
    font: "bold 120px sans-serif",
    color: {{color}},
    align: "center"
  });
  game.addText("tapHint", "Tap anywhere!", game.width() / 2, game.height() / 2 + 80, {
    font: "bold 24px sans-serif",
    color: "#888",
    align: "center"
  });
  game.addText("goalText", "Goal: {{maxCount}}", game.width() / 2, 30, {
    font: "bold 20px sans-serif",
    color: "#888",
    align: "center"
  });
  game.onTapAnywhere("counting-display", function(x, y) {
    var c = game.get("count");
    if (c >= {{maxCount}}) {
      game.set("count", 0);
      game.updateText("countDisplay", "0");
      game.updateText("tapHint", "Tap anywhere!");
      return;
    }
    c = c + 1;
    game.set("count", c);
    game.updateText("countDisplay", String(c));
    game.burst(x, y, { count: 8, spread: 3, colors: ["#FF6B9D", "#FDE047", "#67E8F9"], shape: "star", life: 20 });
    game.playTone(300 + c * 50, 100, { type: "sine", volume: 0.3 });
    var txt = game.getEntity("countDisplay");
    if (txt) game.tween(txt, { scaleX: 1.3, scaleY: 1.3 }, 100, { easing: "easeOut", onComplete: function() { game.tween(txt, { scaleX: 1, scaleY: 1 }, 100); } });
    if (c >= {{maxCount}}) {
      game.updateText("tapHint", "You did it! Tap to restart!");
      game.burst(game.width() / 2, game.height() / 2, { count: 30, spread: 8, colors: ["#FF6B9D", "#FDE047", "#67E8F9", "#C084FC"], shape: "star", life: 50 });
      game.shake(5, 200);
    }
  });
})();`,
        order: 1,
      },
    ],
  },
  {
    id: "magic-wand",
    titleKey: "template_magic_wand_title",
    emoji: "✨",
    descriptionKey: "template_magic_wand_desc",
    blocks: [
      {
        id: "magic-bg",
        type: "setup",
        label: "Background",
        emoji: "🎨",
        enabled: true,
        params: [
          {
            key: "bgColor",
            label: "Background Color",
            type: "color",
            value: "#1a1a2e",
          },
        ],
        code: `game.setBackground({{bgColor}});`,
        order: 0,
      },
      {
        id: "magic-sparkles",
        type: "event",
        label: "Sparkle Magic",
        emoji: "✨",
        enabled: true,
        params: [
          {
            key: "sparkleCount",
            label: "Sparkles per tap",
            type: "number",
            value: 5,
            min: 1,
            max: 15,
            step: 1,
          },
        ],
        code: `(function() {
  var emojis = ["✨", "⭐", "💫", "🌟", "🪄"];
  var sparkleId = 0;
  game.addText("hint", "Tap anywhere for magic!", game.width() / 2, game.height() - 30, {
    font: "bold 18px sans-serif",
    color: "#ffe66d",
    align: "center"
  });
  game.onTapAnywhere("magic-sparkles", function(x, y) {
    for (var i = 0; i < {{sparkleCount}}; i++) {
      (function() {
        var id = "spark-" + (sparkleId++);
        var offsetX = (Math.random() - 0.5) * 80;
        var offsetY = (Math.random() - 0.5) * 80;
        var emoji = emojis[Math.floor(Math.random() * emojis.length)];
        var e = game.addEntity(id, {
          text: emoji,
          x: (x || game.width() / 2) + offsetX,
          y: (y || game.height() / 2) + offsetY,
          width: 32,
          height: 32,
          fontSize: 28,
          _life: 60,
          _vy: -1.5
        });
        var frameCount = 0;
        game.onUpdate(id + "-life", function() {
          frameCount++;
          e.y += e._vy;
          e.fontSize = Math.max(8, 28 - frameCount * 0.3);
          if (frameCount >= 60) {
            game.off(id + "-life");
            game.removeEntity(id);
          }
        });
      })();
    }
  });
})();`,
        order: 1,
      },
    ],
  },
  {
    id: "emoji-rain",
    titleKey: "template_emoji_rain_title",
    emoji: "🌧️",
    descriptionKey: "template_emoji_rain_desc",
    blocks: [
      {
        id: "rain-bg",
        type: "setup",
        label: "Background",
        emoji: "🎨",
        enabled: true,
        params: [
          {
            key: "bgColor",
            label: "Sky Color",
            type: "color",
            value: "#87ceeb",
          },
        ],
        code: `game.setBackground({{bgColor}});`,
        order: 0,
      },
      {
        id: "rain-drops",
        type: "visual",
        label: "Emoji Rain",
        emoji: "🌧️",
        enabled: true,
        params: [
          {
            key: "speed",
            label: "Fall Speed",
            type: "number",
            value: 3,
            min: 1,
            max: 10,
            step: 1,
          },
          {
            key: "count",
            label: "Drop Count",
            type: "number",
            value: 15,
            min: 5,
            max: 40,
            step: 5,
          },
        ],
        code: `(function() {
  var emojis = ["🌧️", "⛈️", "🌨️", "❄️", "🌟", "⭐"];
  var drops = [];
  for (var i = 0; i < {{count}}; i++) {
    var id = "drop-" + i;
    var emoji = emojis[Math.floor(Math.random() * emojis.length)];
    var drop = game.addEntity(id, {
      text: emoji,
      x: Math.random() * game.width(),
      y: Math.random() * game.height() - game.height(),
      width: 32,
      height: 32,
      fontSize: 28,
      _speed: {{speed}} + Math.random() * 2
    });
    drops.push(drop);
  }
  game.onUpdate("rain-update", function() {
    for (var i = 0; i < drops.length; i++) {
      drops[i].y += drops[i]._speed;
      if (drops[i].y > game.height() + 40) {
        drops[i].y = -40;
        drops[i].x = Math.random() * game.width();
      }
    }
  });
  game.addText("tapHint", "Tap for lightning!", game.width() / 2, game.height() - 30, {
    font: "bold 18px sans-serif",
    color: "#222",
    align: "center"
  });
  game.onTapAnywhere("rain-tap", function(x, y) {
    game.burst(x, y, { count: 12, spread: 5, colors: ["#FDE047", "#ffffff", "#67E8F9"], shape: "star", life: 20 });
    game.playTone(200, 200, { type: "sawtooth", volume: 0.2 });
    game.shake(4, 150);
  });
})();`,
        order: 1,
      },
    ],
  },
];
