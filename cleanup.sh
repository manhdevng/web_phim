#!/bin/bash
echo "Stopping any existing Next.js processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
echo "Removing lock file..."
rm -rf .next/dev/lock
echo "Cleanup complete."
