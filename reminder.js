document.addEventListener('DOMContentLoaded', () => {
    const keepLearningButton = document.getElementById('keepLearning');
    const takeBreakButton = document.getElementById('takeBreak');

    keepLearningButton.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'endBreak' });
        window.close(); // Closes the current tab
    });

    takeBreakButton.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'startBreak' }, (response) => {
            if (response.status === 'OK') {
                chrome.storage.sync.get(['lastPage'], (data) => {
                    if (data.lastPage) {
                        window.location.href = data.lastPage;
                    }
                });
            }
        });
    });
});