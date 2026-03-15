import type { Block } from "../types/block";

/**
 * Default blocks shown on the welcome screen for new block-based projects.
 * Creates a simple animated background with title text and floating sparkles.
 */
export const DEFAULT_BLOCKS: Block[] = [
  {
    id: "default-bg",
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
    id: "default-title",
    type: "visual",
    label: "Title Text",
    emoji: "✏️",
    enabled: true,
    params: [
      {
        key: "title",
        label: "Title",
        type: "string",
        value: "My Game",
      },
      {
        key: "color",
        label: "Text Color",
        type: "color",
        value: "#FDE047",
      },
    ],
    code: `game.addText("title", {{title}}, game.width() / 2, game.height() / 2, {
  font: "bold 48px sans-serif",
  color: {{color}},
  align: "center"
});`,
    order: 1,
  },
  {
    id: "default-sparkle",
    type: "visual",
    label: "Sparkle Animation",
    emoji: "✨",
    enabled: true,
    params: [
      {
        key: "count",
        label: "Sparkle Count",
        type: "number",
        value: 12,
        min: 1,
        max: 30,
        step: 1,
      },
    ],
    code: `(function() {
  var sparkles = [];
  for (var i = 0; i < {{count}}; i++) {
    var s = game.addEntity("sparkle-" + i, {
      text: "✨",
      x: Math.random() * game.width(),
      y: Math.random() * game.height(),
      width: 24,
      height: 24,
      fontSize: 20,
      _vx: (Math.random() - 0.5) * 0.5,
      _vy: (Math.random() - 0.5) * 0.5,
      _phase: Math.random() * Math.PI * 2
    });
    sparkles.push(s);
  }
  var t = 0;
  game.onUpdate("default-sparkle", function() {
    t += 0.02;
    for (var i = 0; i < sparkles.length; i++) {
      var s = sparkles[i];
      s.x += s._vx;
      s.y += s._vy;
      s.fontSize = 16 + Math.sin(t + s._phase) * 6;
      if (s.x < -30) s.x = game.width() + 20;
      if (s.x > game.width() + 30) s.x = -20;
      if (s.y < -30) s.y = game.height() + 20;
      if (s.y > game.height() + 30) s.y = -20;
    }
  });
})();`,
    order: 2,
  },
  {
    id: "default-tap",
    type: "event",
    label: "Tap Magic",
    emoji: "👆",
    enabled: true,
    params: [],
    code: `(function() {
  game.addText("tapHint", "Tap anywhere!", game.width() / 2, game.height() / 2 + 60, {
    font: "bold 20px sans-serif",
    color: "#888",
    align: "center"
  });
  var _tapCount = 0;
  var _colors = ["#FF6B9D", "#67E8F9", "#FDE047", "#C084FC", "#4ADE80", "#FFB86C"];
  game.onTapAnywhere("default-tap", function(x, y) {
    _tapCount++;
    var c = _colors[_tapCount % _colors.length];
    game.burst(x, y, { count: 12, spread: 4, colors: [c, "#ffffff"], shape: "star", life: 25 });
    game.playTone(300 + _tapCount * 40, 100, { type: "sine", volume: 0.3 });
    game.shake(2, 80);
    var title = game.getEntity("title");
    if (title) game.tween(title, { scaleX: 1.1, scaleY: 1.1 }, 80, { easing: "easeOut", onComplete: function() { game.tween(title, { scaleX: 1, scaleY: 1 }, 80); } });
  });
})();`,
    order: 3,
  },
];
