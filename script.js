// // document.addEventListener('DOMContentLoaded', () => {
// //     const textarea = document.getElementById('text');
// //     const surahContainer = document.getElementById('surah-container');

// //     // Fetch Surah Al-Fatiha
// //     fetch('https://api.alquran.cloud/v1/surah/1')
// //         .then(response => response.json())
// //         .then(data => {
// //             const surah = data.data;
// //             const ayahs = surah.ayahs.map(ayah => ayah.text).join(' ');
// //             surahContainer.innerHTML = `
// //                 <h2>${surah.name} - ${surah.englishName}</h2>
// //                 <p class="arabic-text">${ayahs}</p>
// //             `;
// //         })
// //         .catch(error => console.error('Error:', error));

// //     textarea.addEventListener('input', () => {
// //         // Handle text input changes
// //         console.log('Text changed:', textarea.value);
// //     });
// // });
// document.addEventListener('DOMContentLoaded', () => {
//     // --- Existing Surah Fetching Code ---
//     const surahContainer = document.getElementById('surah-container');

//     fetch('https://api.alquran.cloud/v1/surah/106') // Fetching Surah Quraysh (106) as per your images
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error(`HTTP error! Status: ${response.status}`);
//             }
//             return response.json();
//         })
//         .then(data => {
//             if (data.status !== "OK" || !data.data) {
//                  throw new Error("API did not return successful data.");
//             }
//             const surah = data.data;
//             // Join Ayahs with a line break or specific separator if needed
//             const ayahsHtml = surah.ayahs.map(ayah => `<span class="ayah-text">${ayah.text}</span>`).join('<br>'); // Separate ayahs visually

//             surahContainer.innerHTML = `
//                 <h2>${surah.name} (${surah.englishName})</h2>
//                 <div class="arabic-text">${ayahsHtml}</div>
//             `;
//         })
//         .catch(error => {
//             console.error('Error fetching Surah:', error);
//             surahContainer.innerHTML = `<p class="error">Could not load Surah data: ${error.message}</p>`;
//         });

//     // --- NEW Audio Recording Code ---

//     const recordButton = document.getElementById('recordButton');
//     const playButton = document.getElementById('playButton');
//     const stopButton = document.getElementById('stopButton');
//     const audioPlayback = document.getElementById('audioPlayback');
//     const canvas = document.getElementById('audioVisualizer');
//     const canvasCtx = canvas.getContext('2d');

//     let mediaRecorder;
//     let audioChunks = [];
//     let audioStream; // To hold the stream from getUserMedia
//     let audioContext;
//     let analyser;
//     let source;
//     let dataArray;
//     let drawVisual; // To hold the requestAnimationFrame ID

//     // --- Visualization Function ---
//     function visualize() {
//         // Set up analyser if not already done
//         if (!analyser) {
//             if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
//             analyser = audioContext.createAnalyser();
//             source = audioContext.createMediaStreamSource(audioStream);
//             source.connect(analyser);
//             // analyser.connect(audioContext.destination); // Don't connect to destination unless you want speaker feedback
//             analyser.fftSize = 2048; // Adjust for detail vs performance
//             const bufferLength = analyser.frequencyBinCount;
//             dataArray = new Uint8Array(bufferLength);
//         }

//         const WIDTH = canvas.width;
//         const HEIGHT = canvas.height;

//         // Function to draw each frame
//         const draw = () => {
//             drawVisual = requestAnimationFrame(draw); // Loop the drawing

//             analyser.getByteTimeDomainData(dataArray); // Get waveform data

//             canvasCtx.fillStyle = 'rgb(240, 240, 240)'; // Background color
//             canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

//             canvasCtx.lineWidth = 2;
//             canvasCtx.strokeStyle = 'rgb(0, 123, 255)'; // Line color

//             canvasCtx.beginPath();

//             const sliceWidth = WIDTH * 1.0 / analyser.frequencyBinCount;
//             let x = 0;

//             for (let i = 0; i < analyser.frequencyBinCount; i++) {
//                 const v = dataArray[i] / 128.0; // Normalize data (0-255 -> 0-2)
//                 const y = v * HEIGHT / 2;

//                 if (i === 0) {
//                     canvasCtx.moveTo(x, y);
//                 } else {
//                     canvasCtx.lineTo(x, y);
//                 }

//                 x += sliceWidth;
//             }

//             canvasCtx.lineTo(canvas.width, canvas.height / 2); // Line to the middle end
//             canvasCtx.stroke();
//         };

//         draw(); // Start the drawing loop
//     }

//     // --- Stop Visualization ---
//     function stopVisualization() {
//         if (drawVisual) {
//             cancelAnimationFrame(drawVisual);
//             drawVisual = null; // Reset the ID
//         }
//          // Optionally clear the canvas
//         canvasCtx.fillStyle = 'rgb(240, 240, 240)';
//         canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
//     }


//     // --- Record Button Action ---
//     recordButton.onclick = async () => {
//         try {
//             // Request microphone access
//             audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

//             // Reset chunks and create MediaRecorder
//             audioChunks = [];
//             mediaRecorder = new MediaRecorder(audioStream);

//             // --- Event Listeners for MediaRecorder ---
//             mediaRecorder.ondataavailable = event => {
//                 if (event.data.size > 0) {
//                     audioChunks.push(event.data);
//                 }
//             };

//             mediaRecorder.onstop = () => {
//                 // Combine chunks into a Blob
//                 const audioBlob = new Blob(audioChunks, { type: 'audio/wav' }); // Or use 'audio/webm' or 'audio/ogg' depending on browser support
//                 const audioUrl = URL.createObjectURL(audioBlob);

//                 // Set the audio source and enable play button
//                 audioPlayback.src = audioUrl;
//                 playButton.disabled = false;
//                 stopButton.disabled = true;
//                 recordButton.disabled = false;

//                 // Stop visualization
//                  stopVisualization();

//                 // Stop the microphone stream tracks *after* recording is fully stopped
//                 if (audioStream) {
//                     audioStream.getTracks().forEach(track => track.stop());
//                     audioStream = null; // Clear the stream variable
//                      // Reset audio context elements related to the stream if needed
//                     if (source) source.disconnect();
//                     source = null;
//                     analyser = null; // Reset analyser to recreate it next time
//                 }

//                  // Optional: Revoke object URL later to free memory,
//                  // e.g., when starting a new recording or closing the page
//                  // audioPlayback.onended = () => { URL.revokeObjectURL(audioUrl); };
//             };

//             // --- Start Recording and Update UI ---
//             mediaRecorder.start();
//             recordButton.disabled = true;
//             stopButton.disabled = false;
//             playButton.disabled = true; // Disable play while recording
//             audioPlayback.src = ''; // Clear previous playback source

//             // Start visualization
//             visualize();

//         } catch (err) {
//             console.error("Error accessing microphone:", err);
//             alert("Could not access microphone. Please ensure permission is granted and no other application is using it.");
//             // Reset button states if permission fails
//             recordButton.disabled = false;
//             stopButton.disabled = true;
//             playButton.disabled = true;
//         }
//     };

//     // --- Stop Button Action ---
//     stopButton.onclick = () => {
//         if (mediaRecorder && mediaRecorder.state === "recording") {
//             mediaRecorder.stop();
//             // UI updates and track stopping are handled in mediaRecorder.onstop
//         }
//     };

//     // --- Play Button Action ---
//     playButton.onclick = () => {
//         if (audioPlayback.src) {
//             audioPlayback.play();
//             // Optional: You could disable the play button while playing
//             // playButton.disabled = true;
//         }
//     };

//     // Optional: Re-enable play button when playback finishes
//     audioPlayback.onended = () => {
//         // playButton.disabled = false;
//     };

//     // Optional: Clean up on page leave
//     window.addEventListener('beforeunload', () => {
//         if (audioStream) {
//             audioStream.getTracks().forEach(track => track.stop());
//         }
//         if (mediaRecorder && mediaRecorder.state === "recording") {
//             mediaRecorder.stop(); // Try to stop cleanly
//         }
//         if (audioPlayback.src && audioPlayback.src.startsWith('blob:')) {
//              URL.revokeObjectURL(audioPlayback.src); // Clean up blob URL
//         }
//     });

// }); // End DOMContentLoaded

document.addEventListener('DOMContentLoaded', () => {
    // --- Existing Surah Fetching Code (keep as is) ---
    const surahContainer = document.getElementById('surah-container');
    fetch('https://api.alquran.cloud/v1/surah/106')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (data.status !== "OK" || !data.data) throw new Error("API did not return successful data.");
            const surah = data.data;
            const ayahsHtml = surah.ayahs.map(ayah => `<span class="ayah-text">${ayah.text}</span>`).join('<br>');
            surahContainer.innerHTML = `<h2>${surah.name} (${surah.englishName})</h2><div class="arabic-text">${ayahsHtml}</div>`;
        })
        .catch(error => {
            console.error('Error fetching Surah:', error);
            surahContainer.innerHTML = `<p class="error">Could not load Surah data: ${error.message}</p>`;
        });

    // --- Audio Recording Code ---
    const recordButton = document.getElementById('recordButton');
    // const playButton = document.getElementById('playButton'); // No longer needed for main controls
    const stopButton = document.getElementById('stopButton');
    const audioPlayback = document.getElementById('audioPlayback'); // Used for playback from list
    const canvas = document.getElementById('audioVisualizer');
    const canvasCtx = canvas.getContext('2d');
    const recordingsListElement = document.getElementById('recordingsList'); // Get the list container

    let mediaRecorder;
    let audioChunks = [];
    let audioStream;
    let audioContext;
    let analyser;
    let source;
    let dataArray;
    let drawVisual;

    let recordings = []; // Array to store recording objects { id, url, blob, name }
    let currentPlayingLi = null; // Keep track of the list item being played

    // --- Visualization Functions (keep visualize() and stopVisualization() as before) ---
    function visualize() { /* ... same as before ... */
         if (!analyser) {
            if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            try {
                 // Ensure audioStream is valid before creating source
                 if (!audioStream || audioStream.getAudioTracks().length === 0 || !audioStream.active) {
                     console.warn("Audio stream not active or available for visualization.");
                     return; // Don't proceed if stream is bad
                 }
                 source = audioContext.createMediaStreamSource(audioStream);
                 source.connect(analyser);
                 analyser.fftSize = 2048;
                 const bufferLength = analyser.frequencyBinCount;
                 dataArray = new Uint8Array(bufferLength);
            } catch (error) {
                 console.error("Error setting up audio source for visualization:", error);
                 // Handle potential errors if the stream becomes invalid
                 return;
            }
        }

        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;

        const draw = () => {
            drawVisual = requestAnimationFrame(draw);
             if (!analyser || !dataArray) return; // Check if analyser is ready

            analyser.getByteTimeDomainData(dataArray);

            canvasCtx.fillStyle = 'rgb(240, 240, 240)';
            canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = 'rgb(0, 123, 255)';
            canvasCtx.beginPath();

            const sliceWidth = WIDTH * 1.0 / analyser.frequencyBinCount;
            let x = 0;

            for (let i = 0; i < analyser.frequencyBinCount; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * HEIGHT / 2;
                if (i === 0) canvasCtx.moveTo(x, y);
                else canvasCtx.lineTo(x, y);
                x += sliceWidth;
            }
            canvasCtx.lineTo(canvas.width, canvas.height / 2);
            canvasCtx.stroke();
        };
        if (!drawVisual) { // Prevent multiple loops if called again
             draw();
        }
    }

    function stopVisualization() { /* ... same as before ... */
        if (drawVisual) {
            cancelAnimationFrame(drawVisual);
            drawVisual = null;
        }
        canvasCtx.fillStyle = 'rgb(240, 240, 240)';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    }


    // --- Function to Render the Recordings List ---
    function renderRecordingsList() {
        recordingsListElement.innerHTML = ''; // Clear the list

        if (recordings.length === 0) {
             recordingsListElement.innerHTML = '<li class="no-recordings">No recordings yet.</li>';
             return;
        }

        recordings.forEach((recording, index) => {
            const li = document.createElement('li');
            li.setAttribute('data-recording-id', recording.id); // Store ID on the element

            const infoSpan = document.createElement('span');
            infoSpan.classList.add('recording-info');
            // Use Date object for better formatting
            const recordingDate = new Date(recording.id);
            infoSpan.textContent = `Recording ${index + 1} (${recordingDate.toLocaleTimeString()})`; // Example name

            const buttonDiv = document.createElement('div'); // Container for buttons

            // Play Button for this item
            const playBtn = document.createElement('button');
            playBtn.textContent = 'Play';
            playBtn.classList.add('play-button');
            playBtn.onclick = () => {
                // Remove 'playing' class from previously played item
                if (currentPlayingLi) {
                    currentPlayingLi.classList.remove('playing');
                }

                // If clicking the button of the currently playing audio, pause it
                 if (audioPlayback.src === recording.url && !audioPlayback.paused) {
                     audioPlayback.pause();
                     li.classList.remove('playing');
                     currentPlayingLi = null;
                     playBtn.textContent = 'Play'; // Change button text back
                 } else {
                     // Otherwise, play the new audio
                     audioPlayback.src = recording.url;
                     audioPlayback.play();
                     li.classList.add('playing'); // Add styling to the current item
                     currentPlayingLi = li;
                     playBtn.textContent = 'Pause'; // Change button text

                    // Update other play buttons in the list
                     updatePlayButtonStates(recording.id);
                 }
            };

            // Delete Button for this item
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.classList.add('delete-button');
            deleteBtn.onclick = () => {
                // Optional: Ask for confirmation
                // if (!confirm(`Are you sure you want to delete Recording ${index + 1}?`)) {
                //     return;
                // }

                // Stop playback if this recording is playing
                if (audioPlayback.src === recording.url && !audioPlayback.paused) {
                    audioPlayback.pause();
                    audioPlayback.src = ''; // Clear src
                }

                // Remove from recordings array
                recordings = recordings.filter(r => r.id !== recording.id);

                // Revoke the Object URL to free memory
                URL.revokeObjectURL(recording.url);
                console.log(`Revoked URL for recording ID: ${recording.id}`);


                // Re-render the list
                renderRecordingsList();
            };

            buttonDiv.appendChild(playBtn);
            buttonDiv.appendChild(deleteBtn);

            li.appendChild(infoSpan);
            li.appendChild(buttonDiv);
            recordingsListElement.appendChild(li);
        });

         // Reset play button texts after rendering
        updatePlayButtonStates(currentPlayingLi ? currentPlayingLi.getAttribute('data-recording-id') : null);
    }

    // --- Helper to update play/pause button text ---
    function updatePlayButtonStates(playingId = null) {
        const listItems = recordingsListElement.querySelectorAll('li[data-recording-id]');
        listItems.forEach(item => {
             const playBtn = item.querySelector('.play-button');
             if (!playBtn) return;
             const itemId = item.getAttribute('data-recording-id');
             if (itemId == playingId && !audioPlayback.paused) { // Use == for potential type difference
                 playBtn.textContent = 'Pause';
             } else {
                 playBtn.textContent = 'Play';
             }
        });
    }

    // --- Record Button Action ---
    recordButton.onclick = async () => {
        try {
            audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioChunks = [];
            mediaRecorder = new MediaRecorder(audioStream);

            mediaRecorder.ondataavailable = event => {
                if (event.data.size > 0) audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                const recordingId = Date.now(); // Use timestamp as a simple ID

                // Create recording object and add to array
                const newRecording = {
                    id: recordingId,
                    url: audioUrl,
                    blob: audioBlob, // Store blob if needed later (e.g., download)
                };
                recordings.push(newRecording);

                // Update UI
                stopButton.disabled = true;
                recordButton.disabled = false;
                renderRecordingsList(); // Re-render the list with the new recording
                stopVisualization();

                // Stop tracks and clean up stream-related resources
                if (audioStream) {
                    audioStream.getTracks().forEach(track => track.stop());
                    audioStream = null;
                }
                if (source) source.disconnect();
                source = null;
                analyser = null; // Reset analyser
            };

            // Start recording and update UI
            mediaRecorder.start();
            recordButton.disabled = true;
            stopButton.disabled = false;
            audioPlayback.src = ''; // Clear any previous playback
            visualize(); // Start visualization

        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone.");
            recordButton.disabled = false; // Re-enable record if failed
            stopButton.disabled = true;
        }
    };

    // --- Stop Button Action ---
    stopButton.onclick = () => {
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
             // Visualization and track stopping now handled in onstop
        }
    };

     // --- Audio Playback Event Listeners ---
    // When playback ends, reset the button text and styling
    audioPlayback.onended = () => {
        if (currentPlayingLi) {
            currentPlayingLi.classList.remove('playing');
            const playBtn = currentPlayingLi.querySelector('.play-button');
            if (playBtn) playBtn.textContent = 'Play';
        }
        currentPlayingLi = null;
    };

    // When playback is manually paused
     audioPlayback.onpause = () => {
         // Check if it was paused intentionally via the button or naturally ended
         // The ended event handles the natural end case.
         // This handles pausing via the button or if the src changes.
         if (currentPlayingLi && audioPlayback.src === currentPlayingLi.querySelector('.play-button')?.closest('li')?.getAttribute('data-recording-id')) {
            // Maybe not needed if pause button updates state directly
            // const playBtn = currentPlayingLi.querySelector('.play-button');
            // if (playBtn) playBtn.textContent = 'Play';
            // currentPlayingLi.classList.remove('playing');
            // Let the play button click handle this logic more cleanly
         }
         // Reset all buttons to 'Play' except potentially the one just clicked to 'Pause'
         updatePlayButtonStates(null);
         if (currentPlayingLi) currentPlayingLi.classList.remove('playing');
         // currentPlayingLi = null; // Don't nullify here, the play click might re-assign it
    };

    // Update play button states when playback starts
    audioPlayback.onplay = () => {
        updatePlayButtonStates(currentPlayingLi ? currentPlayingLi.getAttribute('data-recording-id') : null);
    };


    // --- Initial Render and Cleanup ---
    renderRecordingsList(); // Initial render in case there were persisted recordings (though not implemented here)

    window.addEventListener('beforeunload', () => {
        // Stop any active stream
        if (audioStream) {
            audioStream.getTracks().forEach(track => track.stop());
        }
        // Stop recording if active
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
        }
        // Revoke all blob URLs
        recordings.forEach(rec => {
            console.log(`Revoking URL on unload: ${rec.url}`);
            URL.revokeObjectURL(rec.url);
        });
    });

});