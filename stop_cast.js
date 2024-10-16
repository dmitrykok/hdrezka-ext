// content.js

(function() {
  console.log('Content script loaded');

  let stopCastButton;
  let isCasting = false;

  // Existing code for Next Episode button...

  /**
   * Creates the Stop Casting button and appends it to the player element.
   * The button is created with the text "Stop Casting" and a click event is
   * added to call the stopCasting function to stop the casting session.
   * If the player element is not found, the function will retry every 500ms
   * until it is found. Finally, the function starts monitoring the cast button
   * by calling the monitorCastButton function.
   */
  function createStopCastButton() {
    console.log('Creating Stop Casting button...');
    stopCastButton = document.createElement('pjsdiv');
    stopCastButton.id = 'stop-cast-button';
    stopCastButton.innerText = 'Stop Casting';
    stopCastButton.addEventListener('click', stopCasting);

    const playerElement = document.getElementById('oframecdnplayer');
    if (playerElement) {
      playerElement.appendChild(stopCastButton);
    } else {
      console.error('Player element not found.');
    }

    // Start monitoring the cast button
    monitorCastButton();
  }

  /**
   * Stops the current casting session by simulating a click on the Cast button
   * and its parent element.
   * @return {void}
   */
  function stopCasting() {
    console.log('Stopping casting session...');
      const castButton = document.getElementById('pjs_cast_button_cdnplayer');
      const parentElement = castButton.parentElement.parentElement;
    if (parentElement) {
      parentElement.style.display = 'block';
      parentElement.click();
      castButton.click();
      console.log('Cast button clicked to stop casting.');
      // Optionally hide the Stop Casting button immediately
      stopCastButton.style.display = 'block';
    } else {
      console.error('Cast button not found.');
    }
  }

  /**
   * Monitors the cast button for changes to its casting status by checking the
   * class names of its path elements. When casting starts or stops, the function
   * calls the checkCastingStatus function to update the isCasting variable and
   * hide or show the Stop Casting button accordingly.
   * A MutationObserver is used to monitor changes to the path elements' class
   * names, and the checkCastingStatus function is called whenever a change is
   * detected.
   * @return {void}
   */
  function monitorCastButton() {
    const castButton = document.getElementById('pjs_cast_button_cdnplayer');
    if (!castButton) {
      console.error('Cast button not found.');
      return;
    }

    const svgElement = castButton.querySelector('svg');
    if (!svgElement) {
      console.error('SVG element inside cast button not found.');
      return;
    }

    const pathElements = svgElement.querySelectorAll('path');
    if (pathElements.length === 0) {
      console.error('Path elements inside cast button not found.');
      return;
    }

    /**
    * Checks the casting status by examining the class names of path elements
    * within the cast button's SVG element. If any path element contains the
    * 'cast_caf_state_c' class, it indicates that casting is active.
    * Updates the `isCasting` variable and the display of the Stop Casting button
    * based on whether casting has started or stopped. If casting starts and the
    * Stop Casting button is not already created, it creates the button and makes
    * it visible. If casting stops, it hides the Stop Casting button.
    */
    function checkCastingStatus() {
      let castingActive = false;
      pathElements.forEach(path => {
        if (path.classList.contains('cast_caf_state_c')) {
          castingActive = true;
        }
      });

      if (castingActive && !isCasting) {
        // Casting just started
        isCasting = true;
        console.log('Casting started.');
        if (!stopCastButton) {
          createStopCastButton();
        }
        stopCastButton.style.display = 'block';
      } else if (!castingActive && isCasting) {
        // Casting just stopped
        isCasting = false;
        console.log('Casting stopped.');
        if (stopCastButton) {
          stopCastButton.style.display = 'none';
        }
      }
    }

    // Use MutationObserver to monitor class changes on path elements
    const observerConfig = { attributes: true, attributeFilter: ['class'] };
    const observer = new MutationObserver(checkCastingStatus);

    pathElements.forEach(path => {
      observer.observe(path, observerConfig);
    });

    // Initial check
    checkCastingStatus();
  }

  // Start monitoring the cast button
//   monitorCastButton();
  setTimeout(monitorCastButton, 1000);

  // Existing code for Next Episode button...

})();
