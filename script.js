// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
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