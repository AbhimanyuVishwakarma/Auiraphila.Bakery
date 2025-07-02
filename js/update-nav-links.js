// Script to update HTML files with nav-utils.js import
const fs = require('fs');
const path = require('path');

// Directories to search for HTML files
const DIRECTORIES = [
    path.join(__dirname, '..'),  // Root directory
    path.join(__dirname, '..', 'pages'),  // Pages directory
    path.join(__dirname, '..', 'pages', 'category'),  // Category pages
    path.join(__dirname, '..', 'admin')  // Admin pages
];

// Script tag to add
const NAV_UTILS_SCRIPT = '<script src="../js/nav-utils.js" type="module"></script>';
const ROOT_NAV_UTILS_SCRIPT = '<script src="js/nav-utils.js" type="module"></script>';
const CATEGORY_NAV_UTILS_SCRIPT = '<script src="../../js/nav-utils.js" type="module"></script>';
const ADMIN_NAV_UTILS_SCRIPT = '<script src="../js/nav-utils.js" type="module"></script>';

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
            const filePath = path.join(dir, file);
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Check if nav-utils.js is already included
            if (content.includes('nav-utils.js')) {
                console.log(`Nav utils already included in: ${file}`);
                skippedFiles++;
                return;
            }
            
            // Determine which script tag to use based on file location
            let scriptTag;
            if (dir.includes('category')) {
                scriptTag = CATEGORY_NAV_UTILS_SCRIPT;
            } else if (dir.includes('admin')) {
                scriptTag = ADMIN_NAV_UTILS_SCRIPT;
            } else if (dir.includes('pages')) {
                scriptTag = NAV_UTILS_SCRIPT;
            } else {
                scriptTag = ROOT_NAV_UTILS_SCRIPT;
            }
            
            // Add nav-utils script before closing body tag
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
