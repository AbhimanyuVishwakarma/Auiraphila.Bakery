const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'pages');
const authScript = '    <script src="../js/auth.js" type="module"></script>\n    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>\n';

// Get all HTML files in the pages directory
fs.readdir(pagesDir, (err, files) => {
    if (err) {
        console.error('Error reading pages directory:', err);
        return;
    }

    files.forEach(file => {
        if (file.endsWith('.html') && file !== 'login.html' && file !== 'signup.html' && 
            file !== 'forgot-password.html' && file !== 'reset-password.html') {
            const filePath = path.join(pagesDir, file);
            
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.error(`Error reading file ${file}:`, err);
                    return;
                }

                // Check if auth.js is already included
                if (data.includes('auth.js')) {
                    console.log(`Skipping ${file} - auth.js already included`);
                    return;
                }

                // Find the closing head tag and insert our script before it
                const updatedContent = data.replace(
                    /<\/head>/i, 
                    `    ${authScript}</head>`
                );

                // Write the updated content back to the file
                fs.writeFile(filePath, updatedContent, 'utf8', err => {
                    if (err) {
                        console.error(`Error writing to ${file}:`, err);
                        return;
                    }
                    console.log(`Updated ${file} with auth script`);
                });
            });
        }
    });
});
