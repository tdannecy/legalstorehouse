#!/bin/bash
# http://stackoverflow.com/a/9961420
read -p "Commit description: " desc
git add . && \
git add -u && \
git commit -m "$desc" && \
git push