// 1. Snappier Lenis Setup
const lenis = new Lenis({
    duration: 0.7,           // Lower duration = less "heavy" feeling
    lerp: 0.12,              // Slightly higher lerp = faster response to your finger/wheel
    wheelMultiplier: 1.1,    // Gives you a bit more "kick" per scroll
    gestureOrientation: 'vertical',
    normalizeWheel: true,    // Fixes different scroll speeds across browsers
    smoothWheel: true
});

// Use a high-performance ticker for the loop
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// 2. Optimized GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Tell ScrollTrigger to use Lenis's proxy
lenis.on('scroll', ScrollTrigger.update);

gsap.utils.toArray('.parallax-layer').forEach(layer => {
    const speed = layer.dataset.speed || 0;
    
    gsap.to(layer, {
        y: -speed, 
        ease: "none",
        scrollTrigger: {
            trigger: layer,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.5,       // IMPORTANT: '0.5' is much smoother than 'true'
            fastScrollEnd: true, // Improves performance when scrolling fast
            preventOverlaps: true // Stops animations from "stacking" and lagging
        }
    });
});

// 2. Setup Three.js (Background)
const canvas = document.querySelector('#webgl-bg');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const starsGeo = new THREE.BufferGeometry();
const starsCount = 3000;
const posArray = new Float32Array(starsCount * 3);
for(let i=0; i < starsCount * 3; i++) { 
    posArray[i] = (Math.random() - 0.5) * 100; 
}
starsGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const starsMaterial = new THREE.PointsMaterial({ size: 0.10, color: 0xffffff, transparent: true, opacity: 0.7 });
const stars = new THREE.Points(starsGeo, starsMaterial);
scene.add(stars);
camera.position.z = 30;

// 3. Scroll Animations (GSAP)
gsap.registerPlugin(ScrollTrigger);

// Parallax effect for cards
gsap.utils.toArray('.parallax-layer').forEach(layer => {
    const speed = layer.dataset.speed || 0;
    gsap.to(layer, {
        y: -speed, 
        ease: "none",
        scrollTrigger: {
            trigger: layer,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.5
        }
    });
});

// Background Particles rotation on scroll
gsap.to(stars.rotation, {
    y: Math.PI * 0.5,
    scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1
    }
});

// Custom Cursor logic
const cursor = document.getElementById('custom-cursor');
window.addEventListener('mousemove', (e) => {
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
});

// Animation Loop
// 3. Optimized Animation Loop (The Fix)
function animate() {
    requestAnimationFrame(animate);
    
    // Rotate stars slowly for a floating effect
    starField.rotation.y += 0.0002;
    starField.rotation.x += 0.0001;

    // Optional: Link rotation to scroll
    const scrollY = window.scrollY;
    starField.position.y = scrollY * 0.0005; 

    renderer.render(scene, camera);
}

// Ensure it resizes correctly
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start the loop
animate();

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Add this to your existing script.js
const contactForm = document.getElementById('contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const btn = contactForm.querySelector('.submit-btn');
        btn.innerText = "SENDING...";
        btn.style.opacity = "0.5";
        btn.disabled = true;

        // Simulate success
        setTimeout(() => {
            btn.innerText = "MESSAGE SENT";
            btn.style.background = "#28a745"; // Green success color
            btn.style.color = "#fff";
            btn.style.opacity = "1";
            contactForm.reset();
        }, 1500);
    });
}

// Inside your animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Only update if the window is in focus to save resources
    if (!document.hidden) {
        // Star rotation/movement logic
        stars.rotation.y += 0.0005; 
        
        renderer.render(scene, camera);
    }
}

// Use a more unique name and wrap in a check to prevent redeclaration errors
(function() {
    const mainContactForm = document.getElementById("contact-form");
    const formStatus = document.getElementById("form-status");

    // Only run this logic if the form actually exists on the current page
    if (mainContactForm) {
        mainContactForm.addEventListener("submit", async function(event) {
            event.preventDefault();
            const formData = new FormData(event.target);
            const submitBtn = document.getElementById("submit-btn");
            
            submitBtn.innerText = "SENDING...";
            submitBtn.disabled = true;

            fetch(event.target.action, {
                method: mainContactForm.method,
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    formStatus.innerHTML = "MESSAGE SENT SUCCESSFULLY.";
                    formStatus.style.color = "var(--accent)";
                    mainContactForm.reset();
                } else {
                    response.json().then(data => {
                        formStatus.innerHTML = Object.hasOwn(data, 'errors') 
                            ? data["errors"].map(err => err["message"]).join(", ") 
                            : "OOPS! THERE WAS A PROBLEM.";
                    });
                }
            }).catch(() => {
                formStatus.innerHTML = "OOPS! THERE WAS A PROBLEM.";
            }).finally(() => {
                submitBtn.innerText = "SEND MESSAGE";
                submitBtn.disabled = false;
            });
        });
    }
})();








