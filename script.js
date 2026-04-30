// Enregistrement du plugin ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// === 1. PRELOADER ===
const counter = document.querySelector('.loader-counter');
let count = { var: 0 };

gsap.to(count, {
    var: 100, 
    duration: 1.5, 
    ease: "power2.inOut",
    onUpdate: () => counter.textContent = Math.round(count.var),
    onComplete: initSite // Lance le site uniquement quand le compteur est fini
});

function initSite() {
    gsap.to('#preloader', {
        yPercent: -100,
        duration: 1,
        ease: "power4.inOut",
        delay: 0.3,
        onComplete: () => {
            document.getElementById('preloader').style.display = 'none'; // Détruit le blocage
            startAnimations();
        }
    });
}

function startAnimations() {
    // === 2. HERO ANIMATIONS ===
    const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' }});
    heroTl.to('.hero-title', { opacity: 1, y: 0, duration: 1.5 })
          .to('.hero-subtitle', { opacity: 1, y: 0, duration: 1 }, "-=1.2")
          .to('.hero-scroll', { opacity: 1, duration: 1 }, "-=0.8");

    // === 3. ABOUT SECTION REVEAL ===
    gsap.from('#about .section-num', { opacity: 0, x: -50, scrollTrigger: { trigger: '#about', start: 'top 80%' }});
    gsap.from('#about .section-title', { opacity: 0, y: 100, duration: 1, scrollTrigger: { trigger: '#about', start: 'top 80%' }});
    gsap.from('#about p', { opacity: 0, y: 50, scrollTrigger: { trigger: '#about', start: 'top 60%' }});
    gsap.from('#about .tags span', { opacity: 0, y: 30, stagger: 0.1, scrollTrigger: { trigger: '#about', start: 'top 50%' }});

    // === 4. HORIZONTAL SCROLL (THE BIG EFFECT) ===
    let sections = gsap.utils.toArray('.project-card');
    
    gsap.to(sections, {
        xPercent: -100 * (sections.length - 1),
        ease: "none",
        scrollTrigger: {
            trigger: "#projects",
            pin: true,
            scrub: 1, // Assouplissement du scroll
            end: () => "+=" + (document.querySelector('.horizontal-wrap').scrollWidth - window.innerWidth),
            invalidateOnRefresh: true
        }
    });

    // === 5. CONTACT SECTION REVEAL ===
    gsap.from('#contact .section-num', { opacity: 0, x: -50, scrollTrigger: { trigger: '#contact', start: 'top 80%' }});
    gsap.from('#contact .section-title', { opacity: 0, y: 100, duration: 1, scrollTrigger: { trigger: '#contact', start: 'top 80%' }});
    gsap.from('#contact p, #contact .email-link, #contact .download-cv', { opacity: 0, y: 50, stagger: 0.1, scrollTrigger: { trigger: '#contact', start: 'top 70%' }});
}

// === 6. CUSTOM CURSOR ===
const cursor = document.getElementById('cursor');
let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;

window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

function animateCursor() {
    // Effet de retard (Lerp)
    cursorX += (mouseX - cursorX) * 0.1;
    cursorY += (mouseY - cursorY) * 0.1;
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    requestAnimationFrame(animateCursor);
}
animateCursor();

// Effet Hover sur les éléments cliquables
document.querySelectorAll('a, button, .project-card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});
