// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Select all color boxes
    const colorBoxes = document.querySelectorAll('article section div');
    
    // Add click event listener to each color box
    colorBoxes.forEach(box => {
        box.addEventListener('click', async function() {
            // Get the hex code from the clicked element
            const hexCode = this.textContent.trim();
            
            try {
                // Use the modern Clipboard API
                await navigator.clipboard.writeText(hexCode);
                
                // Add visual feedback
                this.classList.add('copied');
                
                // Remove the feedback class after animation
                setTimeout(() => {
                    this.classList.remove('copied');
                }, 2000);
                
            } catch (err) {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = hexCode;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                try {
                    document.execCommand('copy');
                    
                    // Add visual feedback
                    this.classList.add('copied');
                    
                    // Remove the feedback class after animation
                    setTimeout(() => {
                        this.classList.remove('copied');
                    }, 2000);
                    
                } catch (err) {
                    console.error('Failed to copy hex code:', err);
                    alert('Failed to copy hex code. Please copy manually.');
                }
                
                document.body.removeChild(textArea);
            }
        });
        
        // Add cursor pointer style dynamically
        box.style.cursor = 'pointer';
        
        // Add title attribute for better UX
        box.setAttribute('title', 'Click to copy ' + box.textContent.trim());
    });
});