chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    chrome.storage.sync.get([
        'goal', 
        'startTime', 
        'learningEndTime', 
        'onBreak', 
        'breakEndTime', 
        'lastPage'
    ], (data) => {
        const {
            goal,
            startTime,
            learningEndTime,
            onBreak,
            breakEndTime,
            lastPage
        } = data;

        if (message.action === "setGoal") {
            const { goal, duration } = message.data;
            const startTime = Date.now();
            const learningEndTime = startTime + duration * 60 * 1000;
            
            chrome.storage.sync.set({
                goal, 
                startTime, 
                duration, 
                learningEndTime,
                onBreak: false,
                breakEndTime: null
            }, () => {
                sendResponse({status: 'OK'});
            });

        } else if (message.action === "startBreak") {
            const breakEndTime = Date.now() + 5 * 60 * 1000;
    
            chrome.storage.sync.set({ onBreak: true, breakEndTime }, () => {
                sendResponse({status: 'OK'});
            });
    
            return true;
        } else if (message.action === "endBreak" && onBreak) {
            chrome.storage.sync.set({
                onBreak: false,
                breakEndTime: null
            }, () => {
                chrome.tabs.update(sender.tab.id, { url: lastPage });
                sendResponse({status: 'OK'});
            });

        } else if (message.action === "cancelLearning") {
            chrome.storage.sync.set({
                goal: null,
                startTime: null,
                duration: null,
                learningEndTime: null,
                onBreak: false,
                breakEndTime: null
            }, () => {
                sendResponse({status: 'OK'});
            });

        } else if (message.action === "cancelBreak" && onBreak) {
            chrome.storage.sync.set({
                onBreak: false,
                breakEndTime: null
            }, () => {
                sendResponse({status: 'OK'});
            });
        }
    });

    return true;
});

chrome.webNavigation.onCommitted.addListener(details => {

    if (details.url.includes('reminder.html')) {
        return; // Avoid redirecting if the user is already on the reminder page
    }
    
    chrome.storage.sync.get([
        'goal',
        'learningEndTime',
        'onBreak',
        'breakEndTime'
    ], (data) => {
        const {
            goal,
            learningEndTime,
            onBreak,
            breakEndTime
        } = data;

        if (Date.now() < learningEndTime && !onBreak) {
            const isRelated = checkIfRelated(details.url, goal);

            if (!isRelated) {
                chrome.storage.sync.set({ lastPage: details.url }, () => {
                    chrome.tabs.update(details.tabId, { url: "reminder.html" });
                });
            }
        } else if (onBreak && Date.now() > breakEndTime) {
            chrome.storage.sync.set({
                onBreak: false,
                breakEndTime: null
            }, () => {
                chrome.tabs.update(details.tabId, { url: "reminder.html" });
            });
        }
    });
});

function checkIfRelated(url, goal) {
    if (goal === 'English' && url.includes('english')) {
        return true;
    }
    // Extend with additional conditions based on different learning goals

    return false; // Default to non-related if no conditions are met
}
