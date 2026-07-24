/**
 * Procedural outline geometry for soft bodies.
 *
 * A creature's silhouette starts as a polygon with a corner radius per
 * vertex. That single primitive covers every shape in the cast: a circle is
 * a square with radius half its side, a capsule is a rectangle with radius
 * half its width, a dome is a rectangle rounded only on top.
 *
 * The outline is then sampled at even arc-length intervals into a fixed
 * point array. Deformation happens on those points, and a closed
 * Catmull-Rom spline turns them back into an SVG path. Because the point
 * count never changes, the whole pipeline is allocation-free per frame.
 */

const TAU = Math.PI * 2;
const MIN_RADIUS = 1e-4;
const MIN_SEGMENT = 1e-6;

/**
 * Axis-aligned rectangle as four points, clockwise from the top-left.
 * @param {number} x - Left edge.
 * @param {number} y - Top edge.
 * @param {number} width - Width.
 * @param {number} height - Height.
 * @returns {Array<[number, number]>} Corner points.
 */
export function rectanglePoints(x, y, width, height) {
  return [
    [x, y],
    [x + width, y],
    [x + width, y + height],
    [x, y + height],
  ];
}

/**
 * Turn a polygon with per-vertex radii into a list of line and arc segments.
 * @param {Array<[number, number]>} points - Polygon vertices.
 * @param {number[]} radii - Corner radius per vertex.
 * @returns {object[]} Segments with a `len` field each.
 */
export function roundedOutline(points, radii) {
  const count = points.length;
  const corners = points.map((point, index) =>
    buildCorner(
      point,
      points[(index - 1 + count) % count],
      points[(index + 1) % count],
      radii[index],
    ),
  );

  const segments = [];

  for (let i = 0; i < count; i += 1) {
    const from = corners[(i - 1 + count) % count].exit;
    const to = corners[i].enter;
    const length = distance(from, to);

    if (length > MIN_SEGMENT) {
      segments.push({ type: 'line', a: from, b: to, len: length });
    }

    const { arc } = corners[i];

    if (arc !== null) {
      segments.push({
        type: 'arc',
        centre: arc.centre,
        radius: arc.radius,
        start: arc.start,
        sweep: arc.sweep,
        len: Math.abs(arc.sweep) * arc.radius,
      });
    }
  }

  return segments;
}

/**
 * Sample a closed outline at even arc-length intervals.
 * @param {object[]} segments - Output of `roundedOutline`.
 * @param {number} count - Number of samples.
 * @returns {Array<[number, number]>} Sampled points.
 */
export function sampleOutline(segments, count) {
  const total = segments.reduce((sum, segment) => sum + segment.len, 0);
  const points = [];

  let index = 0;
  let travelled = 0;

  for (let i = 0; i < count; i += 1) {
    const target = (total * i) / count;

    while (
      index < segments.length - 1
      && travelled + segments[index].len < target
    ) {
      travelled += segments[index].len;
      index += 1;
    }

    points.push(
      pointOn(
        segments[index],
        (target - travelled) / segments[index].len,
      ),
    );
  }

  return points;
}

/**
 * Convert a closed point loop into a smooth SVG path.
 *
 * Catmull-Rom control points converted to cubic Bezier, so the curve passes
 * through every sample instead of merely being pulled towards it.
 *
 * @param {Array<[number, number]>} points - Deformed outline points.
 * @param {string[]} scratch - Reused string buffer, one slot per point plus
 *   one. Passing it in keeps the per-frame allocation down to the joined
 *   path string, which SVG requires anyway.
 * @returns {string} Value for the `d` attribute.
 */
export function smoothClosedPath(points, scratch) {
  const count = points.length;

  scratch[0] = `M${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;

  for (let i = 0; i < count; i += 1) {
    const previous = points[(i - 1 + count) % count];
    const current = points[i];
    const next = points[(i + 1) % count];
    const after = points[(i + 2) % count];

    const c1x = current[0] + (next[0] - previous[0]) / 6;
    const c1y = current[1] + (next[1] - previous[1]) / 6;
    const c2x = next[0] - (after[0] - current[0]) / 6;
    const c2y = next[1] - (after[1] - current[1]) / 6;

    scratch[i + 1] =
      `C${c1x.toFixed(1)} ${c1y.toFixed(1)} `
      + `${c2x.toFixed(1)} ${c2y.toFixed(1)} `
      + `${next[0].toFixed(1)} ${next[1].toFixed(1)}`;
  }

  return `${scratch.join('')}Z`;
}

function buildCorner(point, previous, next, radius) {
  const toPrevious = normalise(subtract(previous, point));
  const toNext = normalise(subtract(next, point));
  const dot = Math.max(
    -1,
    Math.min(1, toPrevious[0] * toNext[0] + toPrevious[1] * toNext[1]),
  );
  const half = Math.acos(dot) / 2;

  const maxOffset = Math.min(
    radius / Math.tan(half),
    distance(previous, point) / 2,
    distance(next, point) / 2,
  );
  const effective = maxOffset * Math.tan(half);

  if (!(effective > MIN_RADIUS) || !Number.isFinite(effective)) {
    return { enter: point, exit: point, arc: null };
  }

  const enter = add(point, scale(toPrevious, maxOffset));
  const exit = add(point, scale(toNext, maxOffset));
  const bisector = normalise(add(toPrevious, toNext));
  const centre = add(
    point,
    scale(bisector, effective / Math.sin(half)),
  );

  const start = Math.atan2(enter[1] - centre[1], enter[0] - centre[0]);
  const end = Math.atan2(exit[1] - centre[1], exit[0] - centre[0]);

  return {
    enter,
    exit,
    arc: {
      centre,
      radius: effective,
      start,
      sweep: shortestSweep(end - start),
    },
  };
}

function pointOn(segment, u) {
  const t = Math.max(0, Math.min(1, u));

  if (segment.type === 'line') {
    return [
      segment.a[0] + (segment.b[0] - segment.a[0]) * t,
      segment.a[1] + (segment.b[1] - segment.a[1]) * t,
    ];
  }

  const angle = segment.start + segment.sweep * t;

  return [
    segment.centre[0] + Math.cos(angle) * segment.radius,
    segment.centre[1] + Math.sin(angle) * segment.radius,
  ];
}

function shortestSweep(delta) {
  let sweep = delta;

  while (sweep > Math.PI) {
    sweep -= TAU;
  }

  while (sweep < -Math.PI) {
    sweep += TAU;
  }

  return sweep;
}

function subtract(a, b) {
  return [a[0] - b[0], a[1] - b[1]];
}

function add(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}

function scale(a, k) {
  return [a[0] * k, a[1] * k];
}

function distance(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function normalise(a) {
  const length = Math.hypot(a[0], a[1]) || 1;

  return [a[0] / length, a[1] / length];
}
