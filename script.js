// Translation system
let currentLang = 'en';

function extractSectionLabel(htmlOrElement) {
    const tmp = document.createElement('div');
    if (typeof htmlOrElement === 'string') {
        tmp.innerHTML = htmlOrElement;
    } else if (htmlOrElement) {
        tmp.innerHTML = htmlOrElement.innerHTML;
    }
    const textEl = tmp.querySelector('.section-title-text');
    const raw = textEl ? textEl.innerText : tmp.innerText;
    return raw.replace(/\s+/g, ' ').trim();
}

function updateProjectSectionNavLabels(lang) {
    document.querySelectorAll('.project-section-nav-link').forEach((link) => {
        const label = lang === 'zh' ? link.dataset.zh : link.dataset.en;
        if (label) {
            link.textContent = label;
        }
    });
}

function initProjectSectionNav() {
    const sections = document.querySelectorAll('.project-image-section-title');
    if (sections.length === 0) {
        return;
    }

    const existing = document.querySelector('.project-section-nav');
    if (existing) {
        existing.remove();
    }

    const nav = document.createElement('nav');
    nav.className = 'project-section-nav';
    nav.setAttribute('aria-label', 'Project sections');

    const list = document.createElement('ul');
    list.className = 'project-section-nav-list';

    sections.forEach((section, index) => {
        if (!section.id) {
            section.id = `project-section-${index + 1}`;
        }

        const enLabel = section.dataset.en
            ? extractSectionLabel(section.dataset.en)
            : extractSectionLabel(section);
        const zhLabel = section.dataset.zh
            ? extractSectionLabel(section.dataset.zh)
            : enLabel;

        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#${section.id}`;
        link.className = 'project-section-nav-link';
        link.dataset.sectionId = section.id;
        link.dataset.en = enLabel;
        link.dataset.zh = zhLabel;
        link.textContent = currentLang === 'zh' ? zhLabel : enLabel;

        link.addEventListener('click', (e) => {
            e.preventDefault();
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        li.appendChild(link);
        list.appendChild(li);
    });

    nav.appendChild(list);
    document.body.appendChild(nav);

    const links = nav.querySelectorAll('.project-section-nav-link');
    let activeId = null;

    const setActive = (id) => {
        if (!id || id === activeId) {
            return;
        }
        activeId = id;
        links.forEach((link) => {
            link.classList.toggle('is-active', link.dataset.sectionId === id);
        });
    };

    // Prefer the section nearest the upper third of the viewport
    const spyObserver = new IntersectionObserver(
        (entries) => {
            const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
            if (visible.length > 0) {
                setActive(visible[0].target.id);
            }
        },
        {
            root: null,
            rootMargin: '-20% 0px -55% 0px',
            threshold: [0, 0.25, 0.5, 1]
        }
    );

    sections.forEach((section) => spyObserver.observe(section));

    // Fallback on load / short pages: activate first section once it enters view
    if (sections[0]) {
        setActive(sections[0].id);
    }
}

function translatePage(lang) {
    const elements = document.querySelectorAll('[data-zh]');
    elements.forEach(element => {
        if (lang === 'zh') {
            // Store original English HTML if not already stored
            if (!element.dataset.en) {
                element.dataset.en = element.innerHTML;
            }
            // Set Chinese translation
            element.innerHTML = element.dataset.zh;
        } else {
            // Restore English text
            if (element.dataset.en) {
                element.innerHTML = element.dataset.en;
            }
        }
    });
    
    // Swap images that have English / Chinese asset variants (paths in data attributes)
    document.querySelectorAll('img[data-src-en][data-src-zh]').forEach((img) => {
        img.src = lang === 'zh' ? img.getAttribute('data-src-zh') : img.getAttribute('data-src-en');
    });

    updateProjectSectionNavLabels(lang);
    
    // Update toggle button text
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.textContent = lang === 'zh' ? 'EN' : '中文';
    }
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;
    
    // Save preference to localStorage
    localStorage.setItem('preferredLang', lang);
}

// Initialize language from localStorage or default to English
document.addEventListener('DOMContentLoaded', () => {
    // Build section nav before language swap so English labels can be captured
    initProjectSectionNav();

    // Check for saved language preference
    const savedLang = localStorage.getItem('preferredLang');
    if (savedLang === 'zh') {
        currentLang = 'zh';
        translatePage('zh');
    }
    
    // Language toggle button
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            currentLang = currentLang === 'en' ? 'zh' : 'en';
            translatePage(currentLang);
        });
    }
    // Function to handle project navigation
    function navigateToProject(projectId) {
        // Navigate to the project page
        window.location.href = 'projects/' + projectId + '.html';
    }

    // Add event listeners to all project cards
    const projectCards = document.querySelectorAll('.project-card[data-project]');
    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            const projectId = card.getAttribute('data-project');
            if (projectId) {
                navigateToProject(projectId);
            }
        });
        
        // Add keyboard accessibility
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const projectId = card.getAttribute('data-project');
                if (projectId) {
                    navigateToProject(projectId);
                }
            }
        });
    });

    // Logic for the 'Artist Info' button
    const infoBtn = document.querySelector('.info-btn');
    if (infoBtn) {
        infoBtn.addEventListener('click', () => {
            // Check if we're already on the info page
            const currentPath = window.location.pathname;
            if (currentPath.includes('info.html')) {
                return; // Don't navigate if already on info page
            }
            // Navigate to info page - use path that works from root and subdirectories
            const isInProjectsFolder = currentPath.includes('/projects/');
            window.location.href = isInProjectsFolder ? '../info.html' : 'info.html';
        });
    }

    // Keyword filtering functionality
    const keywordButtons = document.querySelectorAll('.keyword-btn');
    const clearFilterBtn = document.querySelector('.clear-filter-btn');
    const filteredImageItems = document.querySelectorAll('.filtered-image-item');
    let selectedKeywords = new Set();

    // Add click handlers to all filtered images
    filteredImageItems.forEach(item => {
        item.addEventListener('click', () => {
            const projectId = item.getAttribute('data-project');
            if (projectId) {
                navigateToProject(projectId);
            }
        });
    });

    function displayFilteredImages() {
        // If no keywords selected, hide all images
        if (selectedKeywords.size === 0) {
            filteredImageItems.forEach(item => {
                item.classList.remove('visible');
            });
            return;
        }

        // Show/hide images based on keyword matches using visibility instead of display
        filteredImageItems.forEach(item => {
            const keywords = item.getAttribute('data-keywords');
            if (!keywords) {
                item.classList.remove('visible');
                return;
            }

            const keywordArray = keywords.split(',').map(k => k.trim());
            
            // Check if project matches ALL selected keywords (AND logic)
            const selectedKeywordsArray = Array.from(selectedKeywords);
            const matchesAll = selectedKeywordsArray.every(selectedKeyword => 
                keywordArray.includes(selectedKeyword)
            );
            
            if (matchesAll) {
                item.classList.add('visible');
            } else {
                item.classList.remove('visible');
            }
        });
    }

    keywordButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const keyword = btn.getAttribute('data-keyword');
            
            if (selectedKeywords.has(keyword)) {
                selectedKeywords.delete(keyword);
                btn.classList.remove('active');
            } else {
                selectedKeywords.add(keyword);
                btn.classList.add('active');
            }
            
            displayFilteredImages();
        });
    });

    clearFilterBtn.addEventListener('click', () => {
        selectedKeywords.clear();
        keywordButtons.forEach(btn => btn.classList.remove('active'));
        displayFilteredImages();
    });

    // Scroll animation for project cards
    const projectCardsForScroll = document.querySelectorAll('.project-card[data-project]');
    
    // Create Intersection Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('scroll-visible');
            } else {
                entry.target.classList.remove('scroll-visible');
            }
        });
    }, observerOptions);

    // Observe all project cards
    projectCardsForScroll.forEach(card => {
        observer.observe(card);
    });
});