// Script to update HTML files with auth-check.js import
const fs = require('fs');
const path = require('path');

// Public pages that don't need authentication check
const PUBLIC_PAGES = [
    'login.html',
    'signup.html',
    'forgot-password.html',
    'reset-password.html'
];

// Directories to search for HTML files
const DIRECTORIES = [
    path.join(__dirname, '..'),  // Root directory
    path.join(__dirname, '..', 'pages'),  // Pages directory
    path.join(__dirname, '..', 'pages', 'category')  // Category pages
];

// Script tag to add
const AUTH_CHECK_SCRIPT = '<script src="../js/auth-check.js" type="module"></script>';
const ROOT_AUTH_CHECK_SCRIPT = '<script src="js/auth-check.js" type="module"></script>';

// Process HTML files
function processHtmlFiles() {
    let updatedFiles = 0;
    let skippedFiles = 0;
    
    DIRECTORIES.forEach(dir => {
        if (!fs.existsSync(dir)) {
            console.log(`Directory not found: ${dir}`);
            return;
        }
        
        const files = fs.readdirSync(dir).filter(file => file.endsWith('.html'));
        
        files.forEach(file => {
            // Skip public pages
            if (PUBLIC_PAGES.includes(file)) {
                console.log(`Skipping public page: ${file}`);
                skippedFiles++;
                return;
            }
            
            const filePath = path.join(dir, file);
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Check if auth-check.js is already included
            if (content.includes('auth-check.js')) {
                console.log(`Auth check already included in: ${file}`);
                skippedFiles++;
                return;
            }
            
            // Determine which script tag to use based on file location
            const scriptTag = dir.includes('pages') ? AUTH_CHECK_SCRIPT : ROOT_AUTH_CHECK_SCRIPT;
            
            // Add auth-check script before closing body tag
            if (content.includes('</body>')) {
                content = content.replace('</body>', `    ${scriptTag}\n</body>`);
                fs.writeFileSync(filePath, content);
                console.log(`Updated: ${file}`);
                updatedFiles++;
            } else {
                console.log(`Could not find </body> tag in: ${file}`);
                skippedFiles++;
            }
        });
    });
    
    console.log(`\nUpdate complete: ${updatedFiles} files updated, ${skippedFiles} files skipped.`);
}

// Run the script
processHtmlFiles();
