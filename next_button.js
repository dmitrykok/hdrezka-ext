// content.js

(function() {
  console.log('Content script loaded');

  let nextButton;
  let stopCastButton;

  /**
   * Sets the text of the next button based on the next episode.
   * If there is a next episode, the button text is set to
   * "Next Episode: S<season_id>:E<episode_id>" otherwise it is set to "No Next Episode".
   */
  function setNextButtonText() {
    const nextEpisode = getNextEpisodeElement();
    nextButton.innerText = getNextButtonText(nextEpisode);
  }

  /**
   * Returns a string representing the next episode in the following format:
   * "Next Episode: S<season_id>:E<episode_id>" or "No Next Episode" if there is no
   * next episode.
   *
   * @param {Element} nextEpisode - The next episode element.
   * @return {string} The text for the Next Episode button.
   */
  function getNextButtonText(nextEpisode) {
    season_id = null;
    episode_id = null;

    if (
      nextEpisode &&
      nextEpisode.hasAttribute('data-season_id') &&
      nextEpisode.hasAttribute('data-episode_id')
    ) {
      season_id = nextEpisode.getAttribute('data-season_id');
      episode_id = nextEpisode.getAttribute('data-episode_id');
    }

    if (season_id && episode_id) {
      return `Next Episode: S${ season_id }:E${ episode_id }`;
    } else {
      return 'No Next Episode';
    }
  }

  /**
   * Creates the Next Episode button and appends it to the player element.
   * The button is created with the text from the next episode, and a
   * click event is added to navigate to the next episode.
   * The style of the button is set to match the control timeline's
   * background color, and a hover effect is applied to change the
   * background color to rgb(0, 173, 239) when the mouse is over the button.
   * If the control timeline element is not found, the function will
   * retry every 500ms until it is found.
   */
  function createNextButton() {
    console.log('Creating Next Episode button...');

    nextButton = document.createElement('pjsdiv');
    nextButton.id = 'next-episode-button';
    setNextButtonText();
    nextButton.addEventListener('click', navigateToNextEpisode);

    const playerElement = document.getElementById('oframecdnplayer');
    if (playerElement) {
      playerElement.appendChild(nextButton);
    } else {
      console.error('Player element not found.');
    }

    /**
    * Applies the styles to the Next Episode button to match the control timeline's
    * background color and adds a hover effect to change the background color to
    * rgb(0, 173, 239) when the mouse is over the button. If the control timeline element
    * is not found, the function will retry every 500ms until it is found.
    */
    function applyStyles() {
      const controlTimelineElement = document.getElementById('cdnplayer_control_timeline');
      if (controlTimelineElement) {
        // Get all descendant pjsdiv elements
        const descendants = controlTimelineElement.getElementsByTagName('pjsdiv');
        // Get the background color from the first child pjsdiv
        // const firstChild = controlTimelineElement.querySelector('pjsdiv[style*="background-color"]');
        const firstChild = descendants[0]
        let backgroundColor = 'rgb(23, 35, 34)'; // Default value
        if (firstChild) {
          const firstChildStyles = getComputedStyle(firstChild);
          backgroundColor = firstChildStyles.backgroundColor || backgroundColor;
        } else {
          console.warn('First child with background-color not found. Using default color.');
        }
        nextButton.style.backgroundColor = backgroundColor;
        nextButton.style.color = '#fff'; // Ensure text is visible

        // Get the hover background color from the pjsdiv with background rgb(0, 173, 239)
        // const hoverElement = controlTimelineElement.querySelector('pjsdiv[style*="background: rgb(0, 173, 239)"]');
        const hoverElement = descendants[4]
        if (hoverElement) {
          const hoverStyles = getComputedStyle(hoverElement);
          const hoverBackgroundColor = hoverStyles.backgroundColor || 'rgb(0, 173, 239)';

          // Set up hover events
          nextButton.addEventListener('mouseenter', function() {
            nextButton.style.backgroundColor = hoverBackgroundColor;
          });
          nextButton.addEventListener('mouseleave', function() {
            nextButton.style.backgroundColor = backgroundColor;
          });
        } else {
          console.warn('Hover element with background rgb(0, 173, 239) not found. Hover effect will not be applied.');
        }

        // Clear the interval once styles are applied
        clearInterval(styleInterval);
      } else {
        console.warn('Control timeline element not found yet. Retrying...');
      }
    }

    // Attempt to apply styles every 500ms until successful
    const styleInterval = setInterval(applyStyles, 500);

    // Start monitoring the control timeline visibility
    monitorControlTimelineVisibility();
  }

/**
 * Simulates a click on the start button to start the next episode.
 * Retrieves the element using the following DOM traversal:
 * 1. Get the oframecdnplayer element
 * 2. Get the 8th child node (index 7)
 * 3. Get the first child of the 8th node
 * 4. Get the first child of the first child (the start button)
 * 5. Simulate a click on the start button
 */
function startNextEpisode() {
  const oframecdnplayer = document.getElementById('oframecdnplayer');
  const descendants = oframecdnplayer.childNodes;
  const startButton = descendants[7].firstChild.firstChild;
  console.log('Start Next Episode...');
  startButton.click();
}


  /**
  * Returns the next episode element after the currently active episode.
  * If there is no next episode in the same season, it will check if there is a next season
  * and make it visible. If there is a next season, it will return the first episode of that season.
  * If there is no next episode or no next season, it will return null.
  *
  * @return {Element} The next episode element or null.
  */
  function getNextEpisodeElement(){
    console.log('Get next episode element...');

    // Find the currently active episode
    const activeEpisode = document.querySelector('.b-simple_episode__item.active');

    if (activeEpisode) {
      let nextEpisode = activeEpisode.nextElementSibling;

      if (!nextEpisode) {
        // No next sibling, check if there is a next season
        const currentSeasonList = activeEpisode.parentElement;
        const nextSeasonList = currentSeasonList.nextElementSibling;

        if (nextSeasonList && nextSeasonList.classList.contains('b-simple_episodes__list')) {
          // Make the next season's episode list visible
          nextSeasonList.style.display = 'block';
          // Hide the current season's episode list
          currentSeasonList.style.display = 'none';

          // Get the first episode of the next season
          nextEpisode = nextSeasonList.querySelector('.b-simple_episode__item');
        }
      }

      if (nextEpisode && nextEpisode.classList.contains('b-simple_episode__item')) {
        // Simulate a click on the next episode
        console.log('Next episode element found.');
        return nextEpisode;
      } else {
        console.log('This is the last episode.');
      }
    } else {
      console.log('Active episode not found.');
    }
    return null;
  }

  /**
   * Navigates to the next episode by simulating a click on the next episode element.
   * If there is no next episode, the function does nothing.
   * @function navigateToNextEpisode
   */
  function navigateToNextEpisode() {
    console.log('Navigating to the next episode...');

    const nextEpisode = getNextEpisodeElement();

    if (nextEpisode && nextEpisode.classList.contains('b-simple_episode__item')) {
      // Simulate a click on the next episode
      nextEpisode.click();
      setTimeout(setNextButtonText, 2000);
      setTimeout(startNextEpisode, 2000);
      console.log('Next episode clicked.');
    } else {
      console.log('This is the last episode.');
    }
  }

  /**
  * Monitors the control timeline element for changes to its visibility style
  * and updates the Next Episode button's display style accordingly.
  * If the control timeline is visible, the Next Episode button will be displayed
  * in fullscreen mode. If the control timeline is hidden, the Next Episode button
  * will be hidden.
  * A MutationObserver is created to monitor changes to the control timeline element's
  * style attribute, and the Next Episode button's display style is updated accordingly.
  */
  function monitorControlTimelineVisibility() {
    // Get the control timeline element
    const controlTimelineElement = document.getElementById('cdnplayer_control_timeline');

    if (!controlTimelineElement) {
      console.error('Control timeline element not found.');
      return;
    }

    /**
     * Updates the Next Episode button's display style based on the control timeline
     * element's visibility style. If the control timeline is visible and the
     * document is in fullscreen mode, the Next Episode button will be displayed.
     * Otherwise, the button will be hidden.
     * @param {Element} controlTimelineElement The control timeline element
     * @param {Element} nextButton The Next Episode button element
     */
    function updateNextButtonVisibility()
    {
      const isFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      const computedStyle = getComputedStyle(controlTimelineElement);
      const visibility = computedStyle.visibility;
      console.log('Control timeline visibility style:', visibility);
      if (visibility === 'visible') {
        if (isFullscreen) nextButton.style.display = 'block';
      } else if (visibility === 'hidden') {
        nextButton.style.display = 'none';
      } else {
        // Default case if visibility is not set
        nextButton.style.display = 'none';
      }
    }

    // Create a MutationObserver to monitor changes
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          updateNextButtonVisibility();
        }
      });
    });

    // Start observing the control timeline element
    observer.observe(controlTimelineElement, {
      attributes: true, // Watch for attribute changes
      attributeFilter: ['style', 'class'] // Only watch the 'style' attribute
    });

    // Initial check
    updateNextButtonVisibility();
  }

  /**
  * Checks the current fullscreen status of the document and updates the Next
  * Episode button visibility accordingly. If the document is in fullscreen mode,
  * the Next Episode button will be displayed. Otherwise, the button will be hidden.
  * @function checkFullscreen
  */
  function checkFullscreen() {
    console.log('Checking fullscreen status...');
    const isFullscreen = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
    console.log('Is fullscreen:', isFullscreen);
    if (isFullscreen) {
      if (!nextButton) createNextButton();
      // The visibility is now managed by the control timeline visibility
      setNextButtonText();
    } else {
      if (nextButton) nextButton.style.display = 'none';
    }
  }

  // Listen for fullscreen change events
  ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(event => {
    document.addEventListener(event, checkFullscreen);
  });

  // Initial check
  checkFullscreen();
})();
