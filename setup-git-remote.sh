#!/bin/bash

# This script helps set up a Git remote repository connection

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Digital Journal Git Remote Setup${NC}"
echo "This script will help you connect your local repository to a remote Git repository."
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Git is not installed. Please install Git first."
    exit 1
fi

# Prompt for remote repository URL
echo -e "${YELLOW}Enter your remote repository URL (e.g., https://github.com/username/repo.git):${NC}"
read repo_url

if [ -z "$repo_url" ]; then
    echo "Repository URL cannot be empty. Exiting."
    exit 1
fi

# Set the remote origin
echo "Setting remote repository..."
git remote add origin $repo_url

# Verify the remote was added
echo "Verifying remote..."
git remote -v

# Create initial commit if needed
if ! git log -1 &> /dev/null; then
    echo "No commits found. Creating an initial commit..."
    git add .
    git commit -m "Initial commit: Digital Journal application"
fi

# Push to remote
echo -e "${YELLOW}Would you like to push to the remote repository now? (y/n)${NC}"
read push_now

if [ "$push_now" = "y" ] || [ "$push_now" = "Y" ]; then
    echo "Pushing to remote repository..."
    git push -u origin main || git push -u origin master
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Success! Your code has been pushed to the remote repository.${NC}"
    else
        echo "Failed to push to remote repository. Please check your repository URL and try again."
    fi
else
    echo -e "You can push your code later using: ${GREEN}git push -u origin main${NC}"
fi

echo ""
echo -e "${GREEN}Git remote setup complete!${NC}"
echo "You can now use standard Git commands to manage your repository."
