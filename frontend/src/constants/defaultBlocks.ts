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
        value: "#ffffff",
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
];
