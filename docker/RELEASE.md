# Release Process

This document describes how to tag builds, build Docker images, and publish them to a registry.

## Quick Start

### Basic Release (Tag and Build Only)

```bash
./docker/release.sh v1.2.3
```

This will:
- Create a git tag `v1.2.3` on the current commit
- Build a Docker image tagged with `v1.2.3` and `latest`
- **Not** push to any registry (local build only)

### Full Release (Tag, Build, and Push)

```bash
./docker/release.sh v1.2.3 --push --registry docker.io/yourusername
```

Or for GitHub Container Registry:
```bash
./docker/release.sh v1.2.3 --push --registry ghcr.io/yourusername/turret-defense
```

This will:
- Create a git tag `v1.2.3` on the current commit
- Build a Docker image tagged with `v1.2.3` and `latest`
- Push both tags to the specified registry

## Version Format

Use semantic versioning: `vMAJOR.MINOR.PATCH`

Examples:
- `v1.0.0` - Initial release
- `v1.2.3` - Patch release
- `v2.0.0` - Major release
- `v1.2.3-beta` - Pre-release (optional)

## Docker Registry Options

### Docker Hub

```bash
./docker/release.sh v1.2.3 --push --registry docker.io/yourusername
```

**Before pushing, login:**
```bash
docker login docker.io
```

### GitHub Container Registry (GHCR)

```bash
./docker/release.sh v1.2.3 --push --registry ghcr.io/yourusername/turret-defense
```

**Before pushing, login:**
```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
```

### Private Registry

```bash
./docker/release.sh v1.2.3 --push --registry registry.example.com/yournamespace
```

## Workflow Examples

### 1. Development → Release

```bash
# Make your changes and commit
git add .
git commit -m "Add new feature"

# Create release
./docker/release.sh v1.2.3 --push --registry docker.io/yourusername
```

### 2. Build Locally First, Push Later

```bash
# Build and tag locally
./docker/release.sh v1.2.3

# Test the image
docker run -d -p 3000:3000 turret-defense:v1.2.3

# If everything looks good, push manually
docker push docker.io/yourusername/turret-defense:v1.2.3
docker push docker.io/yourusername/turret-defense:latest
```

### 3. Update docker-compose.yml to Use Tagged Image

After releasing, you can update `docker/docker-compose.yml` to use a specific version:

```yaml
services:
  turret:
    image: docker.io/yourusername/turret-defense:v1.2.3  # Use specific version
    # ... rest of config
```

Or keep using `latest` for automatic updates:
```yaml
services:
  turret:
    image: docker.io/yourusername/turret-defense:latest
    # ... rest of config
```

## Script Options

```bash
./docker/release.sh [VERSION] [OPTIONS]

Options:
  VERSION              Version tag (e.g., v1.2.3). If not provided, will prompt.
  --push               Push image to registry after building
  --registry REGISTRY  Docker registry (e.g., docker.io/username or ghcr.io/username/repo)
  --help, -h           Show help message
```

## Image Metadata

The Docker image includes build metadata as labels:
- `org.opencontainers.image.version` - Version tag
- `org.opencontainers.image.revision` - Git commit hash
- `org.opencontainers.image.created` - Build timestamp

View metadata:
```bash
docker inspect turret-defense:v1.2.3 | jq '.[0].Config.Labels'
```

## Troubleshooting

### "Tag already exists"
The script will ask if you want to overwrite. If you want to force it:
```bash
git tag -d v1.2.3
git push origin :refs/tags/v1.2.3
./docker/release.sh v1.2.3 --push --registry docker.io/yourusername
```

### "Authentication required"
Make sure you're logged in to your registry:
```bash
docker login docker.io
# or
docker login ghcr.io
```

### "Permission denied"
Make sure the script is executable:
```bash
chmod +x docker/release.sh
```

## Best Practices

1. **Always test locally first** before pushing to registry
2. **Use semantic versioning** consistently
3. **Tag from a clean commit** (commit your changes first)
4. **Push git tags** to keep your repository in sync
5. **Use specific versions in production** (not `latest`)
6. **Document breaking changes** in release notes

## Integration with CI/CD

You can integrate this into CI/CD pipelines. Example for GitHub Actions:

```yaml
- name: Release
  run: |
    ./docker/release.sh ${{ github.ref_name }} --push --registry ghcr.io/${{ github.repository_owner }}
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

