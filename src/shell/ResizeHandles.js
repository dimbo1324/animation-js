/**
 * Edge and corner resize handles for the tile.
 *
 * The available bounds are measured once, on pointer-down. Measuring
 * inside the move handler — as the obvious implementation does — forces a
 * layout on every pointer event, which is the exact pattern the
 * performance doctrine bans.
 *
 * Moves write to shell state rather than to the element. The state effect
 * then applies the size once per frame, so a fast drag produces one style
 * write per frame instead of one per event.
 *
 * While a scene is running the handles are inert. CSS takes them out of
 * the page and the guard below refuses a drag that was already in flight
 * when the animation started.
 */

import { element } from '../core/index.js';
import { sizeLocked } from './state.js';

const HANDLES = [
  {
    position: 'top',
    axis: 'vertical',
    cursor: 'ns-resize',
    x: 0,
    y: -1,
  },
  {
    position: 'bottom',
    axis: 'vertical',
    cursor: 'ns-resize',
    x: 0,
    y: 1,
  },
  {
    position: 'left',
    axis: 'horizontal',
    cursor: 'ew-resize',
    x: -1,
    y: 0,
  },
  {
    position: 'right',
    axis: 'horizontal',
    cursor: 'ew-resize',
    x: 1,
    y: 0,
  },
  {
    position: 'top-left',
    axis: 'corner',
    cursor: 'nwse-resize',
    x: -1,
    y: -1,
  },
  {
    position: 'top-right',
    axis: 'corner',
    cursor: 'nesw-resize',
    x: 1,
    y: -1,
  },
  {
    position: 'bottom-left',
    axis: 'corner',
    cursor: 'nesw-resize',
    x: -1,
    y: 1,
  },
  {
    position: 'bottom-right',
    axis: 'corner',
    cursor: 'nwse-resize',
    x: 1,
    y: 1,
  },
];

/**
 * Create every resize handle and wire up dragging.
 *
 * The tile is centred, so dragging one edge moves the opposite edge by the
 * same amount: the delta counts double.
 *
 * @param {HTMLElement} tile - Tile being resized.
 * @param {object} sizing - The tile's sizing controller.
 * @returns {{ elements: HTMLElement[], dispose: () => void }} Handles.
 */
export function createResizeHandles(tile, sizing) {
  const disposers = [];
  const elements = HANDLES.map((config) => {
    const handle = element(
      'div',
      `tile__handle tile__handle--${config.position}`,
    );

    handle.dataset.axis = config.axis;
    handle.style.cursor = config.cursor;

    disposers.push(attachDrag(handle, tile, sizing, config));

    return handle;
  });

  return {
    elements,

    dispose() {
      for (const dispose of disposers) {
        dispose();
      }
    },
  };
}

function attachDrag(handle, tile, sizing, config) {
  let session = null;

  function onPointerDown(event) {
    if (sizeLocked.value) {
      return;
    }

    event.preventDefault();
    sizing.refresh();

    const start = sizing.current();

    session = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: start.width,
      startHeight: start.height,
    };

    handle.setPointerCapture(event.pointerId);
    tile.classList.add('tile--resizing');
    handle.classList.add('tile__handle--active');
  }

  function onPointerMove(event) {
    if (session === null || event.pointerId !== session.pointerId) {
      return;
    }

    const deltaX = (event.clientX - session.startX) * 2 * config.x;
    const deltaY = (event.clientY - session.startY) * 2 * config.y;

    sizing.resize(
      config.x === 0 ? session.startWidth : session.startWidth + deltaX,
      config.y === 0
        ? session.startHeight
        : session.startHeight + deltaY,
    );
  }

  function endDrag(event) {
    if (session === null || event.pointerId !== session.pointerId) {
      return;
    }

    if (handle.hasPointerCapture(event.pointerId)) {
      handle.releasePointerCapture(event.pointerId);
    }

    session = null;
    tile.classList.remove('tile--resizing');
    handle.classList.remove('tile__handle--active');
  }

  handle.addEventListener('pointerdown', onPointerDown);
  handle.addEventListener('pointermove', onPointerMove);
  handle.addEventListener('pointerup', endDrag);
  handle.addEventListener('pointercancel', endDrag);

  return () => {
    handle.removeEventListener('pointerdown', onPointerDown);
    handle.removeEventListener('pointermove', onPointerMove);
    handle.removeEventListener('pointerup', endDrag);
    handle.removeEventListener('pointercancel', endDrag);
  };
}
