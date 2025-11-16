#!/bin/bash
set -e  # stop on first error

ENV_PATH="../../.env"

# Load environment variables from .env
if [ -f "$ENV_PATH" ]; then
  export $(grep -v '^#' "$ENV_PATH" | xargs)
fi

# Now you can use them normally
echo "Using collection ID: $POSTMAN_COLLECTION_ID"
echo "Using Postman API key: $POSTMAN_API_KEY"
echo "Using spec URL: $SPEC_URL"

# CONFIG
POSTMAN_API_KEY="PMAK-690bb4a24aaf9b00018d0c24-cd88d88630317ae5696502430a802c362b"
COLLECTION_ID="40906664-c667d952-d78b-47de-ae3d-730fa99912e9"
SPEC_URL=$SPEC_URL
TMP_SPEC="spec.json"
TMP_COLLECTION="postman_collection.json"

# STEP 1: Download current spec from Flask
echo "Downloading latest spec from Flasgger..."
curl -s $SPEC_URL -o $TMP_SPEC

# STEP 2: Convert Swagger → Postman format
echo "Converting to Postman collection..."
openapi2postmanv2 -s $TMP_SPEC -o $TMP_COLLECTION -p

# STEP 3: Update existing collection by uploading the newly updated openAPI spec
echo "Updating Postman collection..."
curl -X PUT "https://api.getpostman.com/collections/${COLLECTION_ID}" \
  -H "X-Api-Key: ${POSTMAN_API_KEY}" \
  -H "Content-Type: application/json" \
   -d "{\"collection\": $(cat ${TMP_COLLECTION})}"

echo "Postman collection updated successfully!"
