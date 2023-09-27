document.addEventListener('DOMContentLoaded', () => {
  const setGoalForm = document.getElementById('setGoalForm');
  const learningTarget = document.getElementById('learningTarget');
  const learningDuration = document.getElementById('learningDuration');
  const cancelLearningButton = document.getElementById('cancelLearningButton');
  const cancelBreakButton = document.getElementById('cancelBreakButton');
  const currentGoal = document.getElementById('currentGoal');
  const remainingTime = document.getElementById('remainingTime');
  const statusDisplay = document.getElementById('statusDisplay');

  setGoalForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const goal = learningTarget.value;
      const duration = parseInt(learningDuration.value);

      chrome.runtime.sendMessage({
          action: 'setGoal',
          data: { goal, duration }
      }, (response) => {
          if (response.status === 'OK') {
              updateUI();
          }
      });
  });

  cancelLearningButton.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'cancelLearning' }, (response) => {
          if (response.status === 'OK') {
              updateUI();
          }
      });
  });

  cancelBreakButton.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'cancelBreak' }, (response) => {
          if (response.status === 'OK') {
              updateUI();
          }
      });
  });

  const updateUI = () => {
      chrome.storage.sync.get(['goal', 'learningEndTime', 'onBreak', 'breakEndTime'], (data) => {
          const { goal, learningEndTime, onBreak, breakEndTime } = data;
          
          if (goal && learningEndTime) {
              const timeLeft = Math.round((learningEndTime - Date.now()) / 60000);
              currentGoal.textContent = `Learning Goal: ${goal}`;
              remainingTime.textContent = `Time Remaining: ${timeLeft > 0 ? timeLeft : 0} minutes`;
              statusDisplay.style.display = 'block';
              setGoalForm.style.display = 'none';
              cancelLearningButton.style.display = 'block';
          } else {
              currentGoal.textContent = '';
              remainingTime.textContent = '';
              statusDisplay.style.display = 'none';
              setGoalForm.style.display = 'block';
              cancelLearningButton.style.display = 'none';
          }

          if (onBreak && breakEndTime) {
              const breakTimeLeft = Math.round((breakEndTime - Date.now()) / 60000);
              remainingTime.textContent += ` | Break Time Remaining: ${breakTimeLeft > 0 ? breakTimeLeft : 0} minutes`;
              cancelBreakButton.style.display = 'block';
          } else {
              cancelBreakButton.style.display = 'none';
          }
      });
  };

  // Initial UI setup
  updateUI();
});
