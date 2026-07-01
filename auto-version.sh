#!/bin/bash
echo "{\"version\":\"2.2.$(date +%Y%m%d%H%M)\",\"date\":\"$(date -Iseconds)\"}" > version.json
git add version.json
