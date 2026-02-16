// 1. Unified Smooth Scroll (Lenis)
const lenis = new Lenis({
    duration: 0.8,           
    lerp: 0.1,              
    wheelMultiplier: 1.1,    
    smoothWheel: true,
    orientation: 'vertical',
    gestureOrientation: 'vertical'
});

// Single High-Performance Ticker
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// 2. Synchronize GSAP & Lenis
gsap.registerPlugin(ScrollTrigger);
lenis.on('scroll', ScrollTrigger.update);

// Parallax Layers - Optimized Scrubbing
gsap.utils.toArray('.parallax-layer').forEach(layer => {
    const speed = layer.dataset.speed || 0;
    
    gsap.to(layer, {
        y: -speed, 
        ease: "none",
        scrollTrigger: {
            trigger: layer,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,       // Higher scrub value = smoother, less jerky movement
            fastScrollEnd: true,
            preventOverlaps: true
        }
    });
});

// 3. Clean Background (Three.js)
const canvas = document.querySelector('#webgl-bg');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    canvas, 
    antialias: false, // Disabling antialias significantly improves mobile performance
    alpha: true,
    powerPreference: "high-performance" 
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Caps pixel ratio to 2 for 4k monitors
renderer.setSize(window.innerWidth, window.innerHeight);

// Optimized Starfield (Reducing Count to 2000 for zero lag)
const starsGeo = new THREE.BufferGeometry();
const starsCount = 2000; 
const posArray = new Float32Array(starsCount * 3);

for(let i=0; i < starsCount * 3; i++) { 
    posArray[i] = (Math.random() - 0.5) * 100; 
}

starsGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const starsMaterial = new THREE.PointsMaterial({ 
    size: 0.08, 
    color: 0xffffff, 
    transparent: true, 
    opacity: 0.5 
});
const stars = new THREE.Points(starsGeo, starsMaterial);
scene.add(stars);
camera.position.z = 30;

// Link Background to Scroll
gsap.to(stars.rotation, {
    y: Math.PI * 0.25,
    scrollTrigger: {
        trigger: "body",
        scrub: 1.5 // Slower rotation prevents "jitter" while scrolling
    }
});

// 4. Interaction Logic
const cursor = document.getElementById('custom-cursor');
if(cursor) {
    window.addEventListener('mousemove', (e) => {
        gsap.to(cursor, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.1, // Using GSAP for the cursor is smoother than direct CSS
            ease: "power2.out"
        });
    });
}

// 5. Unified Animation Loop
function animate() {
    if (!document.hidden) {
        stars.rotation.y += 0.0003; 
        renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);
}
animate();

// Handle Resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

(function() {
    const mainContactForm = document.getElementById("contact-form");
    const formStatus = document.getElementById("form-status");
    const submitBtn = document.getElementById("submit-btn");

    if (mainContactForm) {
        mainContactForm.addEventListener("submit", function(event) {
            // This prevents the redirection to Formspree's "Thanks" page
            event.preventDefault(); 
            
            const formData = new FormData(event.target);
            
            // Visual feedback: Change button state
            submitBtn.innerText = "SENDING...";
            submitBtn.disabled = true;

            fetch(event.target.action, {
                method: mainContactForm.method,
                body: formData,
                headers: { 'Accept': 'application/json' }
            }).then(response => {
                if (response.ok) {
                    // SUCCESS: The "Green Message" fix
                    formStatus.innerHTML = "MESSAGE SENT SUCCESSFULLY.";
                    formStatus.style.color = "#28a745"; // Green color
                    mainContactForm.reset();
                } else {
                    formStatus.innerHTML = "OOPS! THERE WAS A PROBLEM.";
                    formStatus.style.color = "#dc3545"; // Red for errors
                }
            }).catch(() => {
                formStatus.innerHTML = "OOPS! THERE WAS A PROBLEM.";
                formStatus.style.color = "#dc3545";
            }).finally(() => {
                // Revert button text after 2 seconds
                setTimeout(() => {
                    submitBtn.innerText = "SEND MESSAGE";
                    submitBtn.disabled = false;
                }, 2000);
            });
        });
    }
})();