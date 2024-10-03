// content.js

(function() {
  console.log('Content script loaded');

  let nextButton;

  // Function to create the Next Episode button
function createNextButton() {
  console.log('Creating Next Episode button...');
  nextButton = document.createElement('pjsdiv');
  nextButton.id = 'next-episode-button';
  nextButton.innerText = 'Next Episode';
  nextButton.addEventListener('click', navigateToNextEpisode);

  const playerElement = document.getElementById('oframecdnplayer');
  if (playerElement) {
    playerElement.appendChild(nextButton);
  } else {
    console.error('Player element not found.');
  }

  // Function to apply styles when elements are available
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

  // Function to navigate to the next episode
  function navigateToNextEpisode() {
    console.log('Navigating to the next episode...');
    
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
        nextEpisode.click();
        console.log('Next episode clicked.');
      } else {
        alert('This is the last episode.');
      }
    } else {
      alert('Active episode not found.');
    }
  }

  // Function to monitor the visibility of the control timeline
  function monitorControlTimelineVisibility() {
    // Get the control timeline element
    const controlTimelineElement = document.getElementById('cdnplayer_control_timeline');
    
    if (!controlTimelineElement) {
      console.error('Control timeline element not found.');
      return;
    }

    // Function to update the visibility of the Next Episode button
    function updateNextButtonVisibility() {
      const computedStyle = getComputedStyle(controlTimelineElement);
      const visibility = computedStyle.visibility;
      console.log('Control timeline visibility style:', visibility);
      if (visibility === 'visible') {
        nextButton.style.display = 'block';
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

  // Function to check fullscreen mode
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
