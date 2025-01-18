/**
 * Use to move items to specific location and then remove
 */
const moveToAnimation = async ({
  game,
  element,
  toId,
  remove = false,
}: {
  game: PaxPamirGame;
  element: HTMLElement;
  toId: string;
  remove?: boolean;
}): Promise<void> => {
  console.log('move to animation');
  const toElement = document.getElementById(toId);
  // Get the top, left coordinates of two elements
  const fromRect = element.getBoundingClientRect();
  const toRect = toElement.getBoundingClientRect();
  // Calculate the top and left positions
  const top = toRect.top - fromRect.top;
  const left = toRect.left - fromRect.left;

  const originalPositionStyle = element.style.position;

  element.style.top = `${pxNumber(element.style.top) + top}px`;
  element.style.left = `${pxNumber(element.style.left) + left}px`;

  element.style.position = 'relative';
  await game.animationManager.play(
    new BgaSlideAnimation<BgaAnimationWithOriginSettings>({
      element,
      transitionTimingFunction: 'ease-in-out',
      fromRect,
    })
  );
  if (remove) {
    element.remove();
  } else {
    element.style.position = originalPositionStyle;
  }
};
