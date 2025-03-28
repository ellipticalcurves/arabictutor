document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('text');
    
    textarea.addEventListener('input', () => {
        // Handle text input changes
        console.log('Text changed:', textarea.value);
    });
});
