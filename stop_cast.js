// content.js

(function() {
  console.log('Content script loaded');

  let stopCastButton;
  let isCasting = false;

  // Existing code for Next Episode button...

  // Function to create the Stop Casting button
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

  // Function to simulate click on the cast button to stop casting
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

  // Function to monitor the cast button for casting status
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

    // Function to check casting status based on class names
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
