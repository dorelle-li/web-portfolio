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
});