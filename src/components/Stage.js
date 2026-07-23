/**
 * Stage component — the podium/background card that hosts
 * an animated figure or full scene.
 */

/**
 * Create the stage element
 * @returns {HTMLDivElement} Stage element containing floor and actor slot
 */
export function createStage() {
  const stage = document.createElement('div');
  stage.className = 'stage';

  const glow = document.createElement('div');
  glow.className = 'stage__glow';

  const floor = document.createElement('div');
  floor.className = 'stage__floor';

  const actor = document.createElement('div');
  actor.className = 'stage__actor';
  actor.id = 'stage-actor';

  const placeholder = document.createElement('span');
  placeholder.className = 'stage__placeholder';
  placeholder.textContent = 'Figure goes here';
  actor.appendChild(placeholder);

  stage.append(glow, floor, actor);

  return stage;
}

/**
 * Get the actor slot where a figure/character can be mounted
 * @param {HTMLElement} stage - Stage element created via createStage
 * @returns {HTMLElement | null} Actor slot element
 */
export function getStageActor(stage) {
  return stage.querySelector('.stage__actor');
}
