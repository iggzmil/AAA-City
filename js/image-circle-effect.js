// Enhanced 3D Circle Effect for Images
document.addEventListener('DOMContentLoaded', function() {
    // Initialize rotating images
    const rotatingImages = document.querySelectorAll('.rotating-image');
    rotatingImages.forEach(img => {
        // Set initial data-rotation attribute
        img.setAttribute('data-rotation', '0');

        // Add a subtle wobble effect by randomizing the animation delay
        const randomDelay = Math.random() * -15; // Random delay within the 15s animation duration
        img.style.animationDelay = `${randomDelay}s`;
    });

    // Initialize tilt effect with enhanced settings for 3D circles
    // First, remove any existing data-tilt from inner elements
    document.querySelectorAll('.img-area .image[data-tilt]').forEach(el => {
        // Store the fact that this element had tilt
        el.setAttribute('data-had-tilt', 'true');
        // Remove the data-tilt attribute
        el.removeAttribute('data-tilt');
    });

    // Apply tilt to the parent img-area instead
    const tiltElements = document.querySelectorAll('.img-area');

    // Add data-tilt to img-area elements that contained a tilt element
    // Skip elements with the 'no-tilt' class
    tiltElements.forEach(el => {
        if (el.querySelector('[data-had-tilt="true"]') && !el.classList.contains('no-tilt')) {
            el.setAttribute('data-tilt', '');
        }
    });

    // Initialize tilt on the img-area elements
    const imgAreaTiltElements = document.querySelectorAll('.img-area[data-tilt]');

    if (imgAreaTiltElements.length > 0) {
        // If VanillaTilt is available, initialize with enhanced 3D settings
        if (typeof VanillaTilt !== 'undefined') {
            // Add a special class to help with CSS targeting
            imgAreaTiltElements.forEach(el => {
                el.classList.add('has-tilt-effect');
            });

            VanillaTilt.init(imgAreaTiltElements, {
                max: 15,
                speed: 400,
                glare: false, // Disable glare to prevent transparency issues
                gyroscope: true,
                scale: 1.0, // No scaling effect
                perspective: 1000,
                reset: true, // Ensure reset works properly
                easing: "cubic-bezier(.03,.98,.52,.99)" // Smooth easing
            });

            // Add event listeners to sync circle transformations with tilt
            imgAreaTiltElements.forEach(imgArea => {
                // The imgArea is already the element with tilt
                // When tilt changes, adjust circle positions and rotating image
                imgArea.addEventListener('tiltChange', function(event) {
                    // Access tilt values
                    const tiltX = event.detail.tiltX;
                    const tiltY = event.detail.tiltY;
                    const percentageX = event.detail.percentageX;
                    const percentageY = event.detail.percentageY;

                    // Apply additional transformations to circles based on tilt
                    const circles = imgArea.querySelectorAll('.circle-decoration');
                    circles.forEach((circle, index) => {
                        // Special handling for the about-circle
                        if (circle.classList.contains('about-circle')) {
                            // For the single rotating circle in about section
                            // Calculate depth factor for more pronounced effect
                            const depthFactor = 1.2;

                            // Calculate rotation angles based on tilt - similar to hero section
                            const rotateX = (tiltX * 0.7); // No base rotation, just tilt response
                            const rotateY = tiltY * 0.7 * depthFactor;

                            // Get the current rotation angle from the animation
                            const currentRotation = (Date.now() / 15000 * 360) % 360; // Based on 15s rotation time

                            // Apply transformation that matches hero section approach
                            circle.style.transform = `
                                translate(-50%, -50%)
                                rotateX(${rotateX}deg)
                                rotateY(${rotateY}deg)
                                rotateZ(${currentRotation}deg)
                                scale(${1 + Math.abs(percentageY - 0.5) * 0.1})
                            `;

                            // Enhanced glow effect for about-circle
                            const glowIntensity = 45 + Math.abs(percentageX - 0.5) * 30;
                            const glowOpacity = 0.8 + Math.abs(percentageX - 0.5) * 0.2;
                            circle.style.boxShadow = `0 0 ${glowIntensity}px rgba(0, 210, 255, ${glowOpacity})`;
                        } else {
                            // Original handling for other circle decorations
                            // Calculate depth factor based on circle index (outer circles move more)
                            const depthFactor = 1 + (index * 0.3);

                            // Calculate rotation angles based on tilt
                            const rotateX = 30 + (tiltX * 0.7); // Updated to 30 degrees to match CSS
                            const rotateY = tiltY * 0.7 * depthFactor;
                            const rotateZ = index === 1 ? -percentageX * 10 : percentageX * 10; // Middle circle rotates opposite

                            // Apply transformation that enhances the 3D effect
                            // We're overriding the animation temporarily during tilt
                            circle.style.transform = `
                                translate(-50%, -50%)
                                rotateX(${rotateX}deg)
                                rotateY(${rotateY}deg)
                                rotateZ(${rotateZ}deg)
                                scale(1)
                            `;

                            // Enhance glow effect during tilt
                            const baseColor = index === 1 ? 'rgba(0, 128, 128,' : 'rgba(0, 210, 255,';
                            const opacity = 0.2 + (Math.abs(percentageX - 0.5) * 0.4);
                            circle.style.boxShadow = `0 0 ${15 + (index * 5)}px ${baseColor}${opacity})`;
                        }
                    });

                    // Apply tilt effect to rotating image if present
                    const rotatingImage = imgArea.querySelector('.rotating-image');
                    if (rotatingImage) {
                        // Calculate rotation based on mouse position
                        const baseRotation = parseFloat(rotatingImage.getAttribute('data-rotation') || 0);
                        const newRotation = baseRotation + (percentageX * 2 - 1) * 5; // Subtle rotation adjustment

                        // Apply 3D transformation that follows the tilt
                        rotatingImage.style.transform = `
                            translate(-50%, -50%)
                            rotate(${newRotation}deg)
                            rotateX(${tiltX * 0.5}deg)
                            rotateY(${tiltY * 0.5}deg)
                            scale(${1 + Math.abs(tiltY) * 0.01})
                        `;

                        // Store the current rotation for next update
                        rotatingImage.setAttribute('data-rotation', newRotation);
                    }
                });

                // When tilt ends, restore animations
                imgArea.addEventListener('tiltChange', function() {
                    const circles = imgArea.querySelectorAll('.circle-decoration');
                    circles.forEach((circle) => {
                        // Special handling for about-circle - smoother transition back to normal state
                        if (circle.classList.contains('about-circle')) {
                            // Use a shorter delay to match hero section behavior
                            setTimeout(() => {
                                // Simply remove inline styles to let CSS animations take over
                                circle.style.transform = '';
                                circle.style.boxShadow = '';
                            }, 200);
                        } else {
                            // Original handling for other circles
                            // After a short delay, remove inline styles to let CSS animations take over again
                            setTimeout(() => {
                                circle.style.transform = '';
                                circle.style.boxShadow = '';
                            }, 200);
                        }
                    });

                    // Reset rotating image animation
                    const rotatingImage = imgArea.querySelector('.rotating-image');
                    if (rotatingImage) {
                        setTimeout(() => {
                            rotatingImage.style.transform = '';
                            // Keep track of the last rotation to ensure smooth transition
                            const currentRotation = parseFloat(rotatingImage.getAttribute('data-rotation') || 0);
                            rotatingImage.style.animationDelay = `-${currentRotation / 360 * 15}s`; // Adjust based on 15s animation duration
                        }, 300);
                    }
                }, { once: true });
            });
        }
    }
});
