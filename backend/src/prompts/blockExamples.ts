export const BLOCK_EXAMPLES = `
## Block Examples

### Setup Block (gradient background with floating particles)
{
  "id": "bg-setup",
  "type": "setup",
  "label": "Magical Sky",
  "emoji": "🌌",
  "enabled": true,
  "params": [
    { "key": "color1", "label": "Top Color", "type": "color", "value": "#1a1a2e" },
    { "key": "color2", "label": "Bottom Color", "type": "color", "value": "#16213e" }
  ],
  "code": "game.setBackgroundGradient('linear', [{{color1}}, {{color2}}], 180);",
  "order": 0
}

### Visual Block (floating ambient particles)
{
  "id": "ambient-particles",
  "type": "visual",
  "label": "Floating Sparkles",
  "emoji": "✨",
  "enabled": true,
  "params": [{ "key": "count", "label": "Sparkle Count", "type": "number", "value": 8, "min": 1, "max": 30, "step": 1 }],
  "code": "for (var i = 0; i < {{count}}; i++) {\\n  game.addEntity('sparkle-' + i, {\\n    shape: 'circle',\\n    x: Math.random() * game.width(),\\n    y: Math.random() * game.height(),\\n    width: 4 + Math.random() * 6,\\n    height: 4 + Math.random() * 6,\\n    color: '#ffffff',\\n    opacity: 0.3 + Math.random() * 0.5,\\n    shadowBlur: 15,\\n    shadowColor: '#67E8F9',\\n    zIndex: -1,\\n    _speed: 0.2 + Math.random() * 0.5,\\n    _baseY: Math.random() * game.height(),\\n    _offset: Math.random() * Math.PI * 2\\n  });\\n}\\ngame.onUpdate('ambient-particles', function() {\\n  for (var i = 0; i < {{count}}; i++) {\\n    var s = game.getEntity('sparkle-' + i);\\n    if (!s) continue;\\n    s.y = s._baseY + Math.sin(game.time() / 1000 + s._offset) * 30;\\n    s.opacity = 0.3 + Math.sin(game.time() / 800 + s._offset) * 0.3;\\n  }\\n});",
  "order": 1
}

### Character Block (player with bounce-in animation)
{
  "id": "player",
  "type": "character",
  "label": "Hero Character",
  "emoji": "🐱",
  "enabled": true,
  "params": [
    { "key": "emoji", "label": "Character", "type": "string", "value": "🐱" },
    { "key": "size", "label": "Size", "type": "number", "value": 56, "min": 16, "max": 128, "step": 8 }
  ],
  "code": "game.addEntity('player', { text: {{emoji}}, x: game.width() / 2, y: game.height() - 100, width: {{size}}, height: {{size}}, fontSize: {{size}}, scaleX: 0, scaleY: 0 });\\ngame.tween('player', { scaleX: 1, scaleY: 1 }, 600, { easing: 'bounce' });",
  "order": 2
}

### Movement Block (smooth keyboard controls with trail)
{
  "id": "player-move",
  "type": "movement",
  "label": "Keyboard Controls",
  "emoji": "⌨️",
  "enabled": true,
  "params": [{ "key": "speed", "label": "Speed", "type": "number", "value": 5, "min": 1, "max": 20, "step": 1 }],
  "code": "var keys = {};\\ngame.on('keydown', 'player-move', function(e) { keys[e.key] = true; });\\ngame.on('keyup', 'player-move', function(e) { keys[e.key] = false; });\\nvar trailTimer = 0;\\ngame.onUpdate('player-move', function() {\\n  var p = game.getEntity('player');\\n  if (!p) return;\\n  var moving = false;\\n  if (keys['ArrowLeft']) { p.x -= {{speed}}; moving = true; }\\n  if (keys['ArrowRight']) { p.x += {{speed}}; moving = true; }\\n  if (keys['ArrowUp']) { p.y -= {{speed}}; moving = true; }\\n  if (keys['ArrowDown']) { p.y += {{speed}}; moving = true; }\\n  p.x = game.clamp(p.x, 0, game.width() - p.width);\\n  p.y = game.clamp(p.y, 0, game.height() - p.height);\\n  if (moving) {\\n    trailTimer++;\\n    if (trailTimer % 3 === 0) {\\n      game.trail(p.x + p.width/2, p.y + p.height/2, { count: 2, size: 4, color: '#C084FC', life: 15 });\\n    }\\n  }\\n});",
  "order": 3
}

### Collision Block (with particle burst celebration)
{
  "id": "player-coin-collision",
  "type": "collision",
  "label": "Coin Pickup",
  "emoji": "💰",
  "enabled": true,
  "params": [],
  "code": "game.onCollision('player', 'coin', 'player-coin-collision', function(p, c) {\\n  game.set('score', (game.get('score') || 0) + 1);\\n  game.burst(c.x + c.width/2, c.y + c.height/2, { count: 12, spread: 4, colors: ['#FDE047', '#FBBF24', '#FB923C'], shape: 'star', life: 40 });\\n  game.shake(3, 150);\\n  c.x = Math.random() * (game.width() - 30);\\n  c.y = Math.random() * (game.height() - 30);\\n  game.tween(c, { scaleX: 1.3, scaleY: 1.3 }, 150, { easing: 'easeOut', onComplete: function() { game.tween(c, { scaleX: 1, scaleY: 1 }, 150); } });\\n});",
  "order": 5
}

### Timer Block (animated spawning — uses game.every!)
{
  "id": "enemy-spawner",
  "type": "timer",
  "label": "Enemy Spawner",
  "emoji": "👾",
  "enabled": true,
  "params": [{ "key": "interval", "label": "Spawn Interval (ms)", "type": "number", "value": 2000, "min": 500, "max": 10000, "step": 500 }],
  "code": "var enemyCount = 0;\\ngame.every('enemy-spawner', {{interval}}, function() {\\n  enemyCount++;\\n  var eid = 'enemy-' + enemyCount;\\n  game.addEntity(eid, {\\n    text: '👾',\\n    x: Math.random() * (game.width() - 40),\\n    y: -40,\\n    width: 36,\\n    height: 36,\\n    fontSize: 32,\\n    opacity: 0\\n  });\\n  game.tween(eid, { y: 0, opacity: 1 }, 400, { easing: 'bounce' });\\n});\\ngame.onUpdate('enemy-spawner', function() {\\n  var all = game.allEntities();\\n  for (var i = 0; i < all.length; i++) {\\n    if (all[i]._id && all[i]._id.indexOf('enemy-') === 0) {\\n      all[i].y += 1.5;\\n      all[i].x += Math.sin(game.time() / 500 + all[i].y) * 0.8;\\n      if (all[i].y > game.height() + 50) game.removeEntity(all[i]._id);\\n    }\\n  }\\n});",
  "order": 4
}

### Drag-and-Drop Block (touch-friendly!)
{
  "id": "drag-player",
  "type": "movement",
  "label": "Drag to Move",
  "emoji": "👆",
  "enabled": true,
  "params": [],
  "code": "game.onDrag('player', 'drag-player', {\\n  onStart: function(e) { game.tween(e, { scaleX: 1.2, scaleY: 1.2 }, 150); },\\n  onEnd: function(e) { game.tween(e, { scaleX: 1, scaleY: 1 }, 150); game.burst(e.x + e.width/2, e.y + e.height/2, { count: 8, spread: 3, colors: ['#C084FC', '#67E8F9'] }); }\\n});",
  "order": 3
}

### Physics Block (bouncing ball with gravity)
{
  "id": "bouncy-ball",
  "type": "character",
  "label": "Bouncing Ball",
  "emoji": "⚽",
  "enabled": true,
  "params": [
    { "key": "gravity", "label": "Gravity", "type": "number", "value": 0.5, "min": 0.1, "max": 2, "step": 0.1 },
    { "key": "bounce", "label": "Bounciness", "type": "number", "value": 0.9, "min": 0.1, "max": 1, "step": 0.05 }
  ],
  "code": "game.addEntity('ball', { shape: 'circle', x: game.width()/2, y: 50, width: 40, height: 40, color: '#FF6B9D', vx: 3, vy: 0, gravity: {{gravity}}, bounce: {{bounce}}, shadowBlur: 15, shadowColor: '#FF6B9D' });\\ngame.onUpdate('bouncy-ball', function() {\\n  game.bounceOffWalls('ball');\\n  var b = game.getEntity('ball');\\n  if (b) game.trail(b.x + 20, b.y + 20, { count: 2, color: '#FF6B9D', life: 10 });\\n});",
  "order": 2
}

### Health Bar Block
{
  "id": "player-health",
  "type": "score",
  "label": "Health Bar",
  "emoji": "❤️",
  "enabled": true,
  "params": [{ "key": "maxHp", "label": "Max HP", "type": "number", "value": 100, "min": 10, "max": 500, "step": 10 }],
  "code": "game.set('hp', {{maxHp}});\\ngame.addBar('health-bar', { x: 20, y: 20, width: 150, height: 16, value: {{maxHp}}, max: {{maxHp}}, color: '#4ADE80', bgColor: '#1a1a2e', radius: 8, zIndex: 20 });\\ngame.onUpdate('player-health', function() {\\n  var bar = game.getEntity('health-bar');\\n  if (bar) bar.value = game.get('hp') || 0;\\n});",
  "order": 10
}

### AI Enemy Block (follows player)
{
  "id": "ai-enemy",
  "type": "character",
  "label": "Chasing Enemy",
  "emoji": "👹",
  "enabled": true,
  "params": [{ "key": "speed", "label": "Chase Speed", "type": "number", "value": 2, "min": 0.5, "max": 8, "step": 0.5 }],
  "code": "game.addEntity('chaser', { text: '👹', x: 50, y: 50, width: 40, height: 40, fontSize: 36 });\\ngame.onUpdate('ai-enemy', function() {\\n  game.followEntity('chaser', 'player', {{speed}});\\n});",
  "order": 3
}

### Score Block (with glow effect)
{
  "id": "score-display",
  "type": "score",
  "label": "Score Counter",
  "emoji": "⭐",
  "enabled": true,
  "params": [{ "key": "color", "label": "Text Color", "type": "color", "value": "#FDE047" }],
  "code": "game.set('score', 0);\\ngame.addText('score-text', 'Score: 0', 20, 40, { font: 'bold 28px sans-serif', color: {{color}}, shadowBlur: 10, shadowColor: {{color}} });\\ngame.onUpdate('score-display', function() {\\n  var t = game.getEntity('score-text');\\n  if (t) t.text = 'Score: ' + (game.get('score') || 0);\\n});",
  "order": 10
}

### Sound Block (play a tone on tap)
{
  "id": "tap-sound",
  "type": "sound",
  "label": "Tap Sound",
  "emoji": "🔔",
  "enabled": true,
  "params": [
    { "key": "freq", "label": "Frequency", "type": "number", "value": 440, "min": 200, "max": 2000, "step": 50 },
    { "key": "duration", "label": "Duration (ms)", "type": "number", "value": 150, "min": 50, "max": 500, "step": 50 }
  ],
  "code": "game.onTapAnywhere('tap-sound', function() {\\n  game.playTone({{freq}}, {{duration}}, { type: 'triangle' });\\n});",
  "order": 15
}

### Sound Block (musical note on tap — enum param)
{
  "id": "tap-note",
  "type": "sound",
  "label": "Tap Note",
  "emoji": "🎵",
  "enabled": true,
  "params": [
    { "key": "note", "label": "Note", "type": "enum", "value": "C4", "options": ["C3", "D3", "E3", "F3", "G3", "A3", "B3", "C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"] }
  ],
  "code": "game.onTapAnywhere('tap-note', function() {\\n  game.playNote({{note}}, 200, { type: 'sine', volume: 0.4 });\\n});",
  "order": 16
}

### Event Block (tap to spawn entities at tap location)
{
  "id": "tap-spawn",
  "type": "event",
  "label": "Tap to Create",
  "emoji": "🎯",
  "enabled": true,
  "params": [
    { "key": "emoji", "label": "Spawn Emoji", "type": "string", "value": "⭐" },
    { "key": "size", "label": "Size", "type": "number", "value": 32, "min": 16, "max": 64, "step": 8 }
  ],
  "code": "var _spawnCount = 0;\\ngame.onTapAnywhere('tap-spawn', function(x, y) {\\n  _spawnCount++;\\n  var id = 'spawned-' + _spawnCount;\\n  game.addEntity(id, { text: {{emoji}}, x: x - {{size}}/2, y: y - {{size}}/2, width: {{size}}, height: {{size}}, fontSize: {{size}}, scaleX: 0, scaleY: 0 });\\n  game.tween(id, { scaleX: 1, scaleY: 1 }, 300, { easing: 'bounce' });\\n  game.burst(x, y, { count: 8, spread: 3, colors: ['#FDE047', '#C084FC'], shape: 'star' });\\n  game.playTone(400 + _spawnCount * 30, 100, { type: 'sine', volume: 0.3 });\\n});",
  "order": 5
}

### Collision Block (overlap collection with repositioning)
{
  "id": "collect-coins",
  "type": "collision",
  "label": "Collect Coins",
  "emoji": "🪙",
  "enabled": true,
  "params": [],
  "code": "game.onOverlap('player', 'coin', 'collect-coins', function(p, c) {\\n  game.set('score', (game.get('score') || 0) + 1);\\n  game.burst(c.x + c.width/2, c.y + c.height/2, { count: 10, colors: ['#FDE047', '#FBBF24'], shape: 'circle' });\\n  game.playTone(800, 80, { type: 'sine', volume: 0.3 });\\n  c.x = game.randomRange(20, game.width() - 50);\\n  c.y = game.randomRange(20, game.height() - 50);\\n});",
  "order": 5
}

### Event Block (game over when condition met)
{
  "id": "game-over",
  "type": "event",
  "label": "Game Over",
  "emoji": "🏁",
  "enabled": true,
  "params": [{ "key": "target", "label": "Score to Win", "type": "number", "value": 10, "min": 1, "max": 100, "step": 1 }],
  "code": "var _gameOver = false;\\ngame.onUpdate('game-over', function() {\\n  if (_gameOver) return;\\n  var score = game.get('score') || 0;\\n  if (score >= {{target}}) {\\n    _gameOver = true;\\n    game.addText('win-text', 'You Win!', game.width()/2, game.height()/2 - 30, { font: 'bold 48px sans-serif', color: '#FDE047', align: 'center', shadowBlur: 20, shadowColor: '#FDE047' });\\n    game.addText('win-score', 'Score: ' + score, game.width()/2, game.height()/2 + 30, { font: 'bold 24px sans-serif', color: '#ffffff', align: 'center' });\\n    game.burst(game.width()/2, game.height()/2, { count: 40, spread: 8, colors: ['#FF6B9D', '#FDE047', '#67E8F9', '#C084FC'], shape: 'star', life: 60 });\\n    game.playTone(523, 200, { type: 'sine' });\\n    game.after('game-over', 200, function() { game.playTone(659, 200, { type: 'sine' }); });\\n    game.after('game-over', 400, function() { game.playTone(784, 400, { type: 'sine' }); });\\n  }\\n});",
  "order": 20
}

### Sound Block (score increase celebration)
{
  "id": "score-sound",
  "type": "sound",
  "label": "Score Sound",
  "emoji": "🎶",
  "enabled": true,
  "params": [],
  "code": "var _lastScore = 0;\\ngame.onUpdate('score-sound', function() {\\n  var s = game.get('score') || 0;\\n  if (s > _lastScore) {\\n    game.playTone(600 + s * 20, 100, { type: 'sine', volume: 0.3 });\\n    _lastScore = s;\\n  }\\n});",
  "order": 17
}
`;
