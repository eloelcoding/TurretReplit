#!/bin/bash

# Release script for Turret Defense
# Tags the latest commit, builds a Docker image, and optionally publishes it
#
# Usage:
#   ./docker/release.sh [VERSION] [--push] [--registry REGISTRY]
#   ./docker/release.sh v1.2.3 --push
#   ./docker/release.sh v1.2.3 --push --registry docker.io/yourusername
#   ./docker/release.sh v1.2.3  # Just tag and build, don't push

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Default values
PUSH=false
REGISTRY="tiger:8011"
VERSION=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --push)
            PUSH=true
            shift
            ;;
        --registry)
            REGISTRY="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [VERSION] [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  VERSION              Version tag (e.g., v1.2.3). If not provided, will prompt."
            echo "  --push               Push image to registry after building"
            echo "  --registry REGISTRY  Docker registry (e.g., docker.io/username or ghcr.io/username/repo)"
            echo "  --help, -h           Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 v1.2.3                    # Tag and build only"
            echo "  $0 v1.2.3 --push             # Tag, build, and push (uses default image name)"
            echo "  $0 v1.2.3 --push --registry docker.io/myuser  # Push to specific registry"
            exit 0
            ;;
        -*)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
        *)
            if [ -z "$VERSION" ]; then
                VERSION="$1"
            else
                echo -e "${RED}Multiple versions specified: $VERSION and $1${NC}"
                exit 1
            fi
            shift
            ;;
    esac
done

# If no version provided, prompt for it
if [ -z "$VERSION" ]; then
    echo -e "${YELLOW}No version specified.${NC}"
    echo "Enter version tag (e.g., v1.2.3):"
    read -r VERSION
    if [ -z "$VERSION" ]; then
        echo -e "${RED}Version cannot be empty${NC}"
        exit 1
    fi
fi

# Validate version format (should start with 'v' and be semantic versioning)
if [[ ! "$VERSION" =~ ^v[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+)?$ ]]; then
    echo -e "${YELLOW}Warning: Version '$VERSION' doesn't follow semantic versioning (vX.Y.Z)${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if tag already exists
if git rev-parse "$VERSION" >/dev/null 2>&1; then
    echo -e "${RED}Tag '$VERSION' already exists!${NC}"
    echo "Existing tag points to: $(git rev-parse "$VERSION")"
    read -p "Overwrite existing tag? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
    echo -e "${YELLOW}Deleting existing tag...${NC}"
    git tag -d "$VERSION" 2>/dev/null || true
    git push origin ":refs/tags/$VERSION" 2>/dev/null || true
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}Warning: You have uncommitted changes.${NC}"
    echo "Uncommitted files:"
    git diff --name-only
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Get current commit hash
COMMIT_HASH=$(git rev-parse --short HEAD)
COMMIT_FULL=$(git rev-parse HEAD)

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  Turret Defense Release${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "Version:     ${GREEN}$VERSION${NC}"
echo -e "Commit:      ${GREEN}$COMMIT_HASH${NC} ($COMMIT_FULL)"
echo -e "Registry:    ${GREEN}${REGISTRY:-<local only>}${NC}"
echo -e "Push:        ${GREEN}$PUSH${NC}"
echo ""

# Step 1: Create git tag
echo -e "${BLUE}[1/4]${NC} Creating git tag..."
git tag -a "$VERSION" -m "Release $VERSION" "$COMMIT_FULL"
echo -e "${GREEN}✓${NC} Tag created: $VERSION"

# Step 2: Build Docker image
echo -e "${BLUE}[2/4]${NC} Building Docker image..."

# Determine image name
if [ -n "$REGISTRY" ]; then
    # Remove trailing slash if present
    REGISTRY="${REGISTRY%/}"
    IMAGE_NAME="${REGISTRY}/turret-defense"
else
    IMAGE_NAME="turret-defense"
fi

# Build with version tag
echo "Building: $IMAGE_NAME:$VERSION"
docker build \
    -f docker/Dockerfile \
    -t "$IMAGE_NAME:$VERSION" \
    -t "$IMAGE_NAME:latest" \
    --build-arg VERSION="$VERSION" \
    --build-arg COMMIT_HASH="$COMMIT_HASH" \
    --build-arg BUILD_DATE="$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
    .

echo -e "${GREEN}✓${NC} Image built: $IMAGE_NAME:$VERSION"

# Step 3: Push git tag (optional)
echo -e "${BLUE}[3/4]${NC} Pushing git tag..."
if git remote | grep -q origin; then
    read -p "Push git tag to origin? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        git push origin "$VERSION"
        echo -e "${GREEN}✓${NC} Tag pushed to origin"
    else
        echo -e "${YELLOW}⊘${NC} Skipped pushing tag"
    fi
else
    echo -e "${YELLOW}⊘${NC} No 'origin' remote found, skipping tag push"
fi

# Step 4: Push Docker image (if requested)
if [ "$PUSH" = true ]; then
    echo -e "${BLUE}[4/4]${NC} Pushing Docker image..."
    
    if [ -z "$REGISTRY" ]; then
        echo -e "${RED}Error: --push requires --registry to be specified${NC}"
        echo "Example: $0 $VERSION --push --registry docker.io/yourusername"
        exit 1
    fi
    
    # Check if user is logged in to the registry
    if ! docker info | grep -q "Username"; then
        echo -e "${YELLOW}Note: You may need to login to the registry first:${NC}"
        echo "  docker login $REGISTRY"
    fi
    
    echo "Pushing: $IMAGE_NAME:$VERSION"
    docker push "$IMAGE_NAME:$VERSION"
    echo -e "${GREEN}✓${NC} Pushed: $IMAGE_NAME:$VERSION"
    
    echo "Pushing: $IMAGE_NAME:latest"
    docker push "$IMAGE_NAME:latest"
    echo -e "${GREEN}✓${NC} Pushed: $IMAGE_NAME:latest"
else
    echo -e "${BLUE}[4/4]${NC} Skipping Docker push (use --push to publish)"
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}  Release Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo "Summary:"
echo "  • Git tag: $VERSION"
echo "  • Docker image: $IMAGE_NAME:$VERSION"
echo "  • Docker image: $IMAGE_NAME:latest"
if [ "$PUSH" = true ]; then
    echo -e "  • ${GREEN}Pushed to registry${NC}"
else
    echo -e "  • ${YELLOW}Not pushed (use --push to publish)${NC}"
fi
echo ""
echo "Next steps:"
if [ "$PUSH" = false ]; then
    echo "  To push the image:"
    echo "    docker push $IMAGE_NAME:$VERSION"
    echo "    docker push $IMAGE_NAME:latest"
fi
echo "  To run the image:"
echo "    docker run -d -p 3000:3000 $IMAGE_NAME:$VERSION"
echo "  To update docker-compose:"
echo "    Update docker/docker-compose.yml image field to: $IMAGE_NAME:$VERSION"

