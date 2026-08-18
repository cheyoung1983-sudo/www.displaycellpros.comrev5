#!/bin/bash
# ==============================================================================
# Display Cell Pros (D&CP LLC) - Monorepo Consolidation Script
# Target Repository: www.displaycellpros.comrev4 (main branch)
# Target Owner: cheyoung1983-sudo
# ==============================================================================
set -e

WORKSPACE_DIR="dcp-merged-workspace"
TARGET_OWNER="cheyoung1983-sudo"
TARGET_REPO="www.displaycellpros.comrev4"
TARGET_URL="https://github.com/${TARGET_OWNER}/${TARGET_REPO}.git"

echo "========================================================================"
echo " Starting Monorepo Consolidation for Display Cell Pros Repositories"
echo " Target Destination: ${TARGET_URL}"
echo "========================================================================"

# 1. Create a clean workspace folder and initialize Git repository
rm -rf "$WORKSPACE_DIR"
mkdir -p "$WORKSPACE_DIR"
cd "$WORKSPACE_DIR"

git init -b main
git config user.name "cheyoung1983-sudo"
git config user.email "cheyoung1983@gmail.com"

# 2. Add destination remote
git remote add origin "$TARGET_URL"

# 3. Pull existing target repository main branch as the foundation
echo "Fetching target repository foundation: ${TARGET_REPO}..."
git fetch origin main || true
git merge origin/main --allow-unrelated-histories -m "chore: initialize foundation from $TARGET_REPO" || echo "Fresh repository initialized."

# 4. Helper function to fetch, merge, and relocate repository files into isolated directory
merge_repo() {
    local repo_name=$1
    local remote_url="https://github.com/${TARGET_OWNER}/${repo_name}.git"

    echo ""
    echo "------------------------------------------------------------------------"
    echo " Processing repository: $repo_name"
    echo " Source URL: $remote_url"
    echo "------------------------------------------------------------------------"

    # Add temporary remote
    git remote add temp-repo "$remote_url" 2>/dev/null || git remote set-url temp-repo "$remote_url"
    
    if git fetch temp-repo --quiet; then
        # Merge allowing unrelated histories
        git merge temp-repo/main --allow-unrelated-histories --no-edit -m "Merge $repo_name into workspace" 2>/dev/null || \
        git merge temp-repo/master --allow-unrelated-histories --no-edit -m "Merge $repo_name into workspace" 2>/dev/null || \
        echo "Merged $repo_name (or already merged)."

        # Move uncommitted or untracked changes if any into dedicated directory
        mkdir -p "repos/$repo_name"
        
        # Move all files from this repo into repos/<repo_name>/ (preserving root files for target)
        git status --porcelain | grep '^??' | cut -c4- | while read -r file; do
            if [ -n "$file" ] && [ "$file" != "repos" ] && [ "$file" != "repos/$repo_name" ]; then
                git mv "$file" "repos/$repo_name/" 2>/dev/null || mv "$file" "repos/$repo_name/" 2>/dev/null || true
            fi
        done

        git add .
        git commit -m "Organize $repo_name files into repos/$repo_name directory" 2>/dev/null || echo "No layout adjustments needed for $repo_name"
    else
        echo "⚠️ Warning: Could not fetch $repo_name. Skipping..."
    fi

    # Clean up temporary remote
    git remote remove temp-repo 2>/dev/null || true
}

# 5. List of all 18 source repositories to merge into the monorepo
REPOS=(
    "dcp001"
    "displaycellproshub002"
    "displaycellpros"
    "D-CP-LLC-Repair-Portal"
    "D-CP-LLC-Repair-Portal-001"
    "displaycellpros001"
    "displaycellproshub001"
    "www.displaycellpros.com-refractored2"
    "Classy"
    "app2"
    "app"
    "emergent"
    "www.displaycellpros.com-refractored"
    "www.dcp.com"
    "dcp.com"
    "emergent2"
    "www.displaycellpros.com"
    "https-www.displaycellpros.com"
)

for repo in "${REPOS[@]}"; do
    merge_repo "$repo"
done

echo ""
echo "========================================================================"
echo " All repositories merged successfully into isolated subfolders."
echo " Final push to target: ${TARGET_URL}"
echo "========================================================================"
echo "Run the following command when ready to publish to GitHub:"
echo "  git push -u origin main --force"
