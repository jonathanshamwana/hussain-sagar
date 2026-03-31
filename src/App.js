import { useEffect, useRef, useState } from 'react';
import './App.css';

const GW = 800;
const GH = 700;
const LAKE_CENTER  = { x: 411, y: 353 };
const BRUSH_RADIUS = 16;
const SPAWN_EVERY  = 1000;
const FIGURE_SPEED = 0.65;
const LAKE_RADIUS  = 168;
const MAX_FIGURES  = 28;
const SPAWN_Y_MIN  = 170;
// Paint should sit visible for ~5s before it begins to fade.
const STROKE_HOLD  = 5000;
const STROKE_FADE  = 8000;
const COLOR_DURATION = 25000; // gradual single transition to brown
const LAKE_GREEN     = { r: 0x6B, g: 0x8F, b: 0x5E };
const LAKE_BROWN     = { r: 0x7A, g: 0x5A, b: 0x3A };

const LAKE_PATH_STR =
  'M 361,182 ' +
  'C 378,168 393,172 408,196 ' +
  'C 424,172 442,162 459,166 ' +
  'C 487,172 514,188 536,216 ' +
  'C 555,242 565,278 565,314 ' +
  'C 563,350 553,384 538,410 ' +
  'C 519,440 499,462 478,480 ' +
  'C 456,498 437,514 410,524 ' +
  'C 398,528 388,526 376,520 ' +
  'C 352,508 327,486 306,460 ' +
  'C 286,436 271,408 264,380 ' +
  'C 257,352 259,324 262,302 ' +
  'C 266,278 276,254 291,234 ' +
  'C 306,214 329,196 350,184 ' +
  'C 356,181 359,181 361,182 Z';

const TRASH = [
  { type: 'rect',    x: 318, y: 220, w: 20, h: 7,  r: 2, fill: '#C4A46A', op: 0.82, angle: -18 },
  { type: 'rect',    x: 450, y: 248, w: 16, h: 6,  r: 1, fill: '#A08858', op: 0.78, angle:  22 },
  { type: 'rect',    x: 390, y: 295, w: 22, h: 8,  r: 2, fill: '#B8956A', op: 0.75, angle:  -6 },
  { type: 'rect',    x: 510, y: 340, w: 17, h: 6,  r: 1, fill: '#9A7C58', op: 0.80, angle:  32 },
  { type: 'rect',    x: 348, y: 435, w: 19, h: 7,  r: 2, fill: '#C2A86E', op: 0.78, angle: -22 },
  { type: 'rect',    x: 452, y: 418, w: 14, h: 5,  r: 1, fill: '#A08260', op: 0.74, angle:   5 },
  { type: 'rect',    x: 295, y: 368, w: 16, h: 6,  r: 2, fill: '#B09270', op: 0.78, angle:  12 },
  { type: 'rect',    x: 420, y: 480, w: 21, h: 7,  r: 2, fill: '#C0986C', op: 0.73, angle:  -8 },
  { type: 'rect',    x: 470, y: 295, w: 18, h: 6,  r: 2, fill: '#A87A50', op: 0.76, angle:  28 },
  { type: 'rect',    x: 310, y: 302, w: 20, h: 7,  r: 2, fill: '#B28565', op: 0.72, angle: -14 },
  { type: 'ellipse', cx: 360, cy: 278, rx: 14, ry: 7,  fill: '#D8CBA8', op: 0.50, angle: -12 },
  { type: 'ellipse', cx: 488, cy: 308, rx: 12, ry: 6,  fill: '#CEC0A0', op: 0.48, angle:  18 },
  { type: 'ellipse', cx: 330, cy: 462, rx: 13, ry: 6,  fill: '#D2C5A4', op: 0.50, angle:   8 },
  { type: 'ellipse', cx: 428, cy: 372, rx: 11, ry: 5,  fill: '#CABEA0', op: 0.46, angle: -20 },
  { type: 'ellipse', cx: 275, cy: 340, rx: 10, ry: 5,  fill: '#D0C8A8', op: 0.45, angle:  10 },
  { type: 'ellipse', cx: 408, cy: 248, rx: 28, ry: 13, fill: '#7CA870', op: 0.38, angle:  -8 },
  { type: 'ellipse', cx: 330, cy: 338, rx: 22, ry: 10, fill: '#70A068', op: 0.35, angle:  16 },
  { type: 'ellipse', cx: 478, cy: 400, rx: 24, ry: 11, fill: '#789A6C', op: 0.38, angle:  -4 },
  { type: 'ellipse', cx: 370, cy: 465, rx: 20, ry:  9, fill: '#6E9465', op: 0.34, angle:   5 },
  { type: 'ellipse', cx: 535, cy: 305, rx: 16, ry:  8, fill: '#78A06A', op: 0.36, angle: -14 },
  { type: 'circle',  cx: 338, cy: 248, r: 3.5, fill: '#8C7258', op: 0.72 },
  { type: 'circle',  cx: 462, cy: 232, r: 3,   fill: '#7A6648', op: 0.68 },
  { type: 'circle',  cx: 530, cy: 298, r: 3.5, fill: '#906250', op: 0.70 },
  { type: 'circle',  cx: 285, cy: 392, r: 3,   fill: '#866248', op: 0.66 },
  { type: 'circle',  cx: 405, cy: 502, r: 3.5, fill: '#8A6C52', op: 0.70 },
  { type: 'circle',  cx: 448, cy: 448, r: 2.5, fill: '#7C5C44', op: 0.62 },
  { type: 'circle',  cx: 495, cy: 262, r: 3,   fill: '#907260', op: 0.66 },
  { type: 'circle',  cx: 365, cy: 398, r: 3.5, fill: '#8A6A52', op: 0.70 },
  { type: 'circle',  cx: 432, cy: 325, r: 2.5, fill: '#806050', op: 0.65 },
  { type: 'circle',  cx: 303, cy: 430, r: 3,   fill: '#7E6248', op: 0.66 },
];

function makeBrushImage() {
  const d  = BRUSH_RADIUS * 2;
  const bc = document.createElement('canvas');
  bc.width = d; bc.height = d;
  const bx = bc.getContext('2d');
  const g  = bx.createRadialGradient(BRUSH_RADIUS, BRUSH_RADIUS, 0, BRUSH_RADIUS, BRUSH_RADIUS, BRUSH_RADIUS);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  bx.fillStyle = g;
  bx.beginPath(); bx.arc(BRUSH_RADIUS, BRUSH_RADIUS, BRUSH_RADIUS, 0, Math.PI * 2); bx.fill();
  return bc;
}
const BRUSH_IMG = makeBrushImage();

function lerp(a, b, t) { return a + (b - a) * t; }
function lerpColor(c1, c2, t) {
  return {
    r: lerp(c1.r, c2.r, t),
    g: lerp(c1.g, c2.g, t),
    b: lerp(c1.b, c2.b, t),
  };
}
function rgbStr(c) { return `rgb(${c.r.toFixed(0)}, ${c.g.toFixed(0)}, ${c.b.toFixed(0)})`; }

function strokeOpacity(age) {
  // Keep opacity tied purely to time so it doesn't vanish faster when more
  // figures gather around the lake.
  if (age < STROKE_HOLD) return 1.0;
  return Math.max(0, 1 - (age - STROKE_HOLD) / STROKE_FADE);
}

function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawTrash(ctx) {
  TRASH.forEach(item => {
    ctx.save();
    ctx.globalAlpha = item.op;
    ctx.fillStyle   = item.fill;
    if (item.type === 'rect') {
      ctx.translate(item.x, item.y);
      ctx.rotate((item.angle * Math.PI) / 180);
      rrect(ctx, -item.w / 2, -item.h / 2, item.w, item.h, item.r); ctx.fill();
    } else if (item.type === 'ellipse') {
      ctx.translate(item.cx, item.cy);
      if (item.angle) ctx.rotate((item.angle * Math.PI) / 180);
      ctx.beginPath(); ctx.ellipse(0, 0, item.rx, item.ry, 0, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(item.cx, item.cy, item.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  });
}

function drawWorker(ctx) {
  ctx.fillStyle = '#2A3040';
  rrect(ctx, -7, -15, 6, 15, 1); ctx.fill();
  rrect(ctx,  1, -15, 6, 15, 1); ctx.fill();
  ctx.fillStyle = '#E07828';
  rrect(ctx, -9, -31, 18, 18, 2); ctx.fill();
  ctx.fillStyle = '#F8D820'; ctx.fillRect(-9, -24, 18, 3);
  ctx.fillStyle = '#C89060';
  ctx.beginPath(); ctx.arc(0, -36, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#F8D820';
  ctx.beginPath(); ctx.arc(0, -38, 9, Math.PI, 0); ctx.fill();
  ctx.fillRect(-10, -41, 20, 4);
}

function drawCitizen(ctx) {
  ctx.fillStyle = '#3A3060';
  rrect(ctx, -7, -15, 6, 15, 1); ctx.fill();
  rrect(ctx,  1, -15, 6, 15, 1); ctx.fill();
  ctx.fillStyle = '#4878B0';
  rrect(ctx, -8, -31, 16, 18, 2); ctx.fill();
  ctx.fillStyle = '#C89060';
  ctx.beginPath(); ctx.arc(0, -36, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3A2808';
  ctx.beginPath(); ctx.arc(0, -39, 7, Math.PI, 0); ctx.fill();
}

function drawFigure(ctx, fig) {
  ctx.save();
  ctx.translate(fig.x, fig.y);
  if (fig.vx < 0) ctx.scale(-1/3, 1/3); else ctx.scale(1/3, 1/3);
  if (fig.type === 'worker') drawWorker(ctx); else drawCitizen(ctx);
  ctx.restore();
}

function spawnFigure(figures) {
  if (figures.length >= MAX_FIGURES) return;
  const type = Math.random() < 0.5 ? 'worker' : 'citizen';
  const side = Math.floor(Math.random() * 3);
  let x, y;
  const yRange = SPAWN_Y_MIN + Math.random() * (GH + 20 - SPAWN_Y_MIN);
  if      (side === 0) { x = GW + 20; y = yRange; }
  else if (side === 1) { x = Math.random() * GW; y = GH + 20; }
  else                 { x = -20;     y = yRange; }
  const dx = LAKE_CENTER.x - x;
  const dy = LAKE_CENTER.y - y;
  const d  = Math.hypot(dx, dy);
  const targetDist = LAKE_RADIUS + Math.random() * 160;
  figures.push({ x, y, vx: (dx/d)*FIGURE_SPEED, vy: (dy/d)*FIGURE_SPEED, type, arrived: false, targetDist });
}

function makeOffscreen() {
  const c = document.createElement('canvas');
  c.width = GW; c.height = GH;
  return [c, c.getContext('2d')];
}

function Hi({ children, bright }) {
  return (
    <span style={{
      color: bright ? '#7BD0E4' : '#5BAFD6',
      background: bright ? 'rgba(91,175,214,0.18)' : 'rgba(91,175,214,0.11)',
      padding: '1px 5px',
      borderRadius: 2,
    }}>
      {children}
    </span>
  );
}

export default function App() {
  const canvasRef  = useRef(null);
  const audioRef   = useRef(null);
  const gameActive = useRef(false);
  const state      = useRef({
    figures:    [],
    strokes:    [],
    lastSpawn:  0,
    lastStroke: { x: -9999, y: -9999 },
    mx: 400, my: 350, inLake: false,
  });
  const [showModal, setShowModal] = useState(true);
  const [filling,   setFilling]   = useState(false);

  const handlePlay = () => {
    setFilling(true);
    if (audioRef.current) audioRef.current.play().catch(() => {});
  };

  const handleFillEnd = () => {
    setShowModal(false);
    gameActive.current = true;
    state.current.lastSpawn = performance.now();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const s      = state.current;

    // Pre-populate 10 initial figures scattered around the lake
    for (let i = 0; i < 20; i++) {
      const angle = (i / 10) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
      const dist  = LAKE_RADIUS + 30 + Math.random() * 140;
      const x     = Math.max(30, Math.min(GW - 30, LAKE_CENTER.x + Math.cos(angle) * dist));
      const y     = Math.max(SPAWN_Y_MIN, Math.min(GH - 50, LAKE_CENTER.y + Math.sin(angle) * dist));
      const type  = Math.random() < 0.5 ? 'worker' : 'citizen';
      const dx    = LAKE_CENTER.x - x;
      const dy    = LAKE_CENTER.y - y;
      const d     = Math.hypot(dx, dy);
      s.figures.push({ x, y, vx: (dx/d)*FIGURE_SPEED, vy: (dy/d)*FIGURE_SPEED, type, arrived: true, targetDist: dist });
    }

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    const lakePath = new Path2D(LAKE_PATH_STR);

    const [paintC, paintCtx] = makeOffscreen();
    const [blueC,  blueCtx]  = makeOffscreen();
    const [,       hitCtx]   = makeOffscreen();

    // Emoji cursor
    const ec = document.createElement('canvas');
    ec.width = 32; ec.height = 32;
    const ectx = ec.getContext('2d');
    ectx.font = '24px serif'; ectx.textAlign = 'center'; ectx.textBaseline = 'middle';
    ectx.fillText('🧽', 16, 16);
    const clothCursor = `url(${ec.toDataURL()}) 12 12, auto`;

    audioRef.current = new Audio('/audio/ambient.mp3');
    audioRef.current.loop   = true;
    audioRef.current.volume = 0.3;

    let prevInLake = false;

    // Lake shade transitions once from green to brown after the game starts.
    let shade = {
      start: LAKE_GREEN,
      end:   LAKE_BROWN,
      startTs: null, // set when gameplay begins
      duration: COLOR_DURATION,
      done: false,
    };

    function onMouseMove(e) {
      const r  = canvas.getBoundingClientRect();
      s.mx     = (e.clientX - r.left) * (GW / r.width);
      s.my     = (e.clientY - r.top)  * (GH / r.height);
      s.inLake = hitCtx.isPointInPath(lakePath, s.mx, s.my);
    }
    canvas.addEventListener('mousemove', onMouseMove);

    let animId, prevTime = 0;

    function loop(ts) {
      const dt = Math.min((ts - prevTime) / 16.67, 3);
      prevTime = ts;
      const sx = canvas.width  / GW;
      const sy = canvas.height / GH;

      // Spawn new figures (only after game starts)
      if (gameActive.current && s.lastSpawn && ts - s.lastSpawn > SPAWN_EVERY) {
        spawnFigure(s.figures);
        s.lastSpawn = ts;
      }

      // Move walking figures
      s.figures.forEach(f => {
        if (f.arrived) return;
        const nx = f.x + f.vx * dt;
        const ny = f.y + f.vy * dt;
        if (hitCtx.isPointInPath(lakePath, nx, ny) || Math.hypot(nx - LAKE_CENTER.x, ny - LAKE_CENTER.y) <= f.targetDist) {
          f.arrived = true;
        } else { f.x = nx; f.y = ny; }
      });

      const arrived = s.figures.filter(f => f.arrived).length;
      if (audioRef.current) audioRef.current.volume = Math.min(1.0, 0.3 + arrived * 0.06);

      // Cursor style
      if (s.inLake !== prevInLake) {
        canvas.style.cursor = s.inLake ? clothCursor : 'default';
        prevInLake = s.inLake;
      }

      // Add paint strokes (distance-throttled so we don't over-sample)
      if (s.inLake) {
        const d = Math.hypot(s.mx - s.lastStroke.x, s.my - s.lastStroke.y);
        if (d > BRUSH_RADIUS * 0.5) {
          s.strokes.push({ x: s.mx, y: s.my, ts });
          s.lastStroke = { x: s.mx, y: s.my };
        }
      }

      // Purge fully-faded strokes (use max arrived for conservative expiry check)
      const maxAge = (STROKE_HOLD + STROKE_FADE);
      s.strokes = s.strokes.filter(st => (ts - st.ts) < maxAge);

      // Render paint canvas fresh each frame from stroke list
      paintCtx.clearRect(0, 0, GW, GH);
      if (s.strokes.length > 0) {
        paintCtx.globalCompositeOperation = 'lighter';
        s.strokes.forEach(st => {
          const op = strokeOpacity(ts - st.ts);
          if (op <= 0) return;
          paintCtx.globalAlpha = op;
          paintCtx.drawImage(BRUSH_IMG, st.x - BRUSH_RADIUS, st.y - BRUSH_RADIUS);
        });
        paintCtx.globalAlpha = 1;
        paintCtx.globalCompositeOperation = 'source-over';
      }

      // Blue canvas: lake fill masked by paint layer
      blueCtx.clearRect(0, 0, GW, GH);
      blueCtx.fillStyle = '#5BAFD6';
      blueCtx.fill(lakePath);
      blueCtx.globalCompositeOperation = 'destination-in';
      blueCtx.drawImage(paintC, 0, 0);
      blueCtx.globalCompositeOperation = 'source-over';

      // Lake base shade tween
      if (!shade.startTs && gameActive.current) {
        shade.startTs = ts;
      }
      let lakeFillColor;
      if (shade.startTs) {
        const shadeT = Math.min(1, (ts - shade.startTs) / shade.duration);
        lakeFillColor = rgbStr(lerpColor(shade.start, shade.end, shadeT));
        if (!shade.done && shadeT >= 1) shade.done = true;
      } else {
        lakeFillColor = rgbStr(LAKE_GREEN);
      }

      // ---- Render scene ----
      ctx.save();
      ctx.scale(sx, sy);

      ctx.fillStyle = '#111120'; ctx.fillRect(0, 0, GW, GH);

      ctx.fillStyle = lakeFillColor; ctx.fill(lakePath);

      ctx.save();
      ctx.globalAlpha = 0.28; ctx.fillStyle = '#638758';
      ctx.beginPath(); ctx.ellipse(418, 320, 125, 88, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 0.22; ctx.fillStyle = '#587A50';
      ctx.beginPath(); ctx.ellipse(360, 420, 82, 54, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      ctx.drawImage(blueC, 0, 0);

      ctx.save(); ctx.clip(lakePath); drawTrash(ctx); ctx.restore();

      ctx.strokeStyle = '#4A6840'; ctx.lineWidth = 2.5; ctx.stroke(lakePath);

      s.figures.forEach(f => drawFigure(ctx, f));

      ctx.restore();

      animId = requestAnimationFrame(loop);
    }

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMouseMove);
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', pointerEvents: showModal ? 'none' : 'auto' }}
      />

      <div style={{
        position: 'absolute', top: '4%', left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center', pointerEvents: 'none', whiteSpace: 'nowrap',
      }}>
        <div style={{ color: '#8FA8A0', fontFamily: 'Georgia, serif', fontSize: 57, letterSpacing: 8 }}>
          DEAD WATER
        </div>
        <div style={{ color: '#4A6058', fontFamily: 'sans-serif', fontSize: 13, letterSpacing: 3, marginTop: 4 }}>
          HUSSAIN SAGAR · HYDERABAD, INDIA
        </div>
      </div>

      {showModal && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(8, 8, 18, 0.90)',
        }}>
          <div style={{
            position: 'relative',
            overflow: 'hidden',
            background: '#0E0F1A',
            border: '1px solid #243428',
            borderRadius: 4,
            padding: '44px 52px 48px',
            maxWidth: 530,
            width: '90%',
            fontFamily: 'Georgia, serif',
            lineHeight: 1.8,
            boxShadow: '0 0 60px rgba(0,0,0,0.6)',
          }}>

            {/* Rising water fill */}
            <div
              onTransitionEnd={filling ? handleFillEnd : undefined}
              style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, #071822 0%, #0E3D52 35%, #1F6880 65%, #3A9AB8 88%, #5BAFD6 100%)',
                transform: filling ? 'translateY(0%)' : 'translateY(106%)',
                transition: filling ? 'transform 1.6s cubic-bezier(0.4, 0.0, 0.2, 1)' : 'none',
                zIndex: 2,
                borderRadius: 3,
              }}
            >
              {/* Wave crest */}
              <div style={{
                position: 'absolute',
                top: -9, left: '-3%', width: '106%', height: 18,
                background: '#3A9AB8',
                borderRadius: '50%',
                animation: filling ? 'waveCrest 1.8s ease-in-out infinite' : 'none',
              }} />
            </div>

            {/* Modal content */}
            <div style={{ position: 'relative', zIndex: 1 }}>

              <div style={{
                color: '#8FA8A0',
                fontFamily: 'Georgia, serif',
                fontSize: 40,
                letterSpacing: 6,
                marginBottom: 28,
                lineHeight: 1,
                textAlign: 'center',
              }}>
                DEAD WATER
              </div>
              <div style={{
                color: '#3A5048',
                fontFamily: 'sans-serif',
                fontSize: 10,
                letterSpacing: 3,
                marginBottom: 28,
                marginTop: -18,
                textAlign: 'center',
              }}>
                HUSSAIN SAGAR · HYDERABAD
              </div>

              <p style={{ margin: '0 0 16px', fontSize: 14.5, color: '#6A8880' }}>
                Hussain Sagar was built in{' '}
                <Hi>1562</Hi>
                {' '}as Hyderabad's primary drinking water source. Today,{' '}
                <Hi>78 million litres of sewage</Hi>
                {' '}and{' '}
                <Hi>15 million litres of industrial effluent</Hi>
                {' '}enter it daily. Multiple restoration projects have been announced.{' '}
                <span style={{ color: '#D8EAE4' }}>None have worked.</span>
              </p>

              <p style={{ margin: '0 0 36px', fontSize: 14.5, color: '#6A8880', fontStyle: 'italic' }}>
                Your task:{' '}
                <Hi bright>Clean the lake.</Hi>
              </p>

              <div style={{
                position: 'relative',
                marginBottom: 28,
                border: '1px solid #1E3740',
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: '0 0 24px rgba(0,0,0,0.35)',
              }}>
                <iframe
                  title="Hussain Sagar Map"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=78.462%2C17.404%2C78.489%2C17.437&layer=mapnik&marker=17.4239%2C78.4738"
                  style={{ width: '100%', height: 240, border: 'none' }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  background: 'linear-gradient(to bottom, rgba(14,15,26,0.25) 0%, rgba(14,15,26,0.55) 100%)',
                }} />
              </div>

              <button
                onClick={handlePlay}
                disabled={filling}
                style={{
                  display: 'block', width: '100%', padding: '13px 0',
                  background: 'transparent',
                  border: '1px solid #2E5040',
                  borderRadius: 3,
                  color: '#5A8870',
                  fontFamily: 'Georgia, serif',
                  fontSize: 14,
                  letterSpacing: 4,
                  cursor: filling ? 'default' : 'pointer',
                }}
                onMouseEnter={e => { if (!filling) { e.target.style.background = '#162420'; e.target.style.color = '#7AADA0'; }}}
                onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#5A8870'; }}
              >
                PLAY GAME
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
