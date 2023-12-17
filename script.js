import {gameTitle, scenario, firstCall, imageStyle, doAfterEachAction} from "./adventureData.js";

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('game-title').innerText = gameTitle;
    const userInputElement = document.getElementById('user-input');
    const userInputFormElement = document.getElementById('user-input-form');
    const statusBarContainer = document.getElementById('status-bars');
    const illustrativeImageElement = document.getElementById('illustrative-image');
    const sceneDescriptionElement = document.getElementById('scene-description');
    const loadingContainer = document.getElementById('loading-container');

    statusBarContainer.innerHTML = '';

    let state = {
        log: '',
    };

    function extractTags(text) {
        const tagRegex = /\$([A-Z_]+)\s(.*?)\$/g;
        const tags = [];

        let match;
        const names = {};
        while ((match = tagRegex.exec(text)) !== null) {
            const name = match[1].replace('_', ' ');
            if(name in names) continue;
            names[name] = true;
            tags.push(`${name}: ${match[2]}`);
        }

        return tags;
    }

    function removeTags(text) {
        const tagRegex = /\$[A-Z_]+\s.*?\$/g;
        return text.replace(tagRegex, '').trim();
    }


    let lastImageUpdateTime = 0;

    function updateDisplay(newState) {
        // Update the scene description
        sceneDescriptionElement.innerHTML = removeTags(newState.txt);

        // Update the status bars
        statusBarContainer.innerHTML = extractTags(newState.txt)
            .filter(x => !x.startsWith("IMAGE:"))
            .map(status => `<div class="d-flex align-items-center"><span class="mx-2">${status}</span></div>`)
            .join('');

        // images?
        const images = extractTags(newState.txt).filter(x => x.startsWith("IMAGE:"));
        const currentTime = new Date().getTime();
        if (images.length === 1 && currentTime - lastImageUpdateTime >= 120000) {
            lastImageUpdateTime = currentTime;
            updateImage(images[0].substring(6)).then(() => {
                console.log("update image done");
            });
        }
    }

    async function callApi(action) {
        showLoading();
        const response = await fetch('backend.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                scn: scenario.split("\n").join(" ").trim(),
                act: action.trim() + "\n(Note: " + doAfterEachAction + ")",
                log: state.log,
            }),
        });
        hideLoading();

        const newState = await response.json();
        if(newState.err) {
            console.error(newState.err);
            return;
        }
        console.log(newState.txt);
        state.log += `\n\n${newState.txt}`;
        updateDisplay(newState);
    }

    function showLoading() {
        loadingContainer.style.display = 'flex';
    }

    function hideLoading() {
        loadingContainer.style.display = 'none';
    }

    async function updateImage(text) {
        text = text + " " + imageStyle;
        console.log("update image: ", text);
        const apiUrl = 'image.php';
        const requestData = {
            text: text
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            const imageUrl = data.img_url;
            console.log("loaded image!", imageUrl);
            illustrativeImageElement.src = imageUrl;
        } catch (error) {
            console.error('Error updating image:', error);
        }
    }



    userInputFormElement.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Get the user action from the input field
        const userAction = userInputElement.value.trim();

        // Call the API with the user action
        await callApi(userAction);

        // Clear the input field
        userInputElement.value = '';
    });

    // Initialize the game
    callApi(firstCall);
});
