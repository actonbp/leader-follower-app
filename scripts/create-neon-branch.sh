#!/bin/bash

# Colors for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Display header
echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   Create Neon Database Branch for Development     ${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""

# Check if curl is installed
if ! command -v curl &> /dev/null; then
    echo -e "${RED}Error: curl is not installed. Please install curl to use this script.${NC}"
    exit 1
fi

# Ask for Neon API key
echo -e "${YELLOW}You'll need a Neon API key to create a new branch.${NC}"
echo -e "Get your API key from: https://console.neon.tech/app/settings/api-keys"
echo ""
read -p "Enter your Neon API key: " NEON_API_KEY

if [[ -z "$NEON_API_KEY" ]]; then
    echo -e "${RED}No API key provided. Aborting.${NC}"
    exit 1
fi

# Ask for Neon project ID
echo ""
echo -e "${YELLOW}You'll need your Neon project ID.${NC}"
echo -e "Find it in the URL when viewing your project: https://console.neon.tech/app/projects/[project_id]"
echo ""
read -p "Enter your Neon project ID: " PROJECT_ID

if [[ -z "$PROJECT_ID" ]]; then
    echo -e "${RED}No project ID provided. Aborting.${NC}"
    exit 1
fi

# Ask for branch name
echo ""
read -p "Enter a name for the new branch (e.g., 'development'): " BRANCH_NAME

if [[ -z "$BRANCH_NAME" ]]; then
    BRANCH_NAME="development"
    echo -e "${YELLOW}Using default branch name: '${BRANCH_NAME}'${NC}"
fi

# Create the branch
echo ""
echo -e "${BLUE}Creating '${BRANCH_NAME}' branch...${NC}"

RESPONSE=$(curl -s -X POST \
  "https://console.neon.tech/api/v2/projects/${PROJECT_ID}/branches" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer ${NEON_API_KEY}" \
  -d "{\"branch\": {\"name\": \"${BRANCH_NAME}\", \"parent_id\": \"br-xxx\"}}" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')

if [[ $HTTP_CODE -ge 200 && $HTTP_CODE -lt 300 ]]; then
    echo -e "${GREEN}Branch created successfully!${NC}"
    
    # Parse connection string from response
    ENDPOINT_ID=$(echo $RESPONSE_BODY | grep -o '"id":"ep-[^"]*' | head -1 | sed 's/"id":"//g')
    echo -e "${BLUE}Getting connection details...${NC}"
    
    # Get connection details
    CONN_RESPONSE=$(curl -s -X GET \
      "https://console.neon.tech/api/v2/projects/${PROJECT_ID}/branches/${BRANCH_NAME}/endpoints/${ENDPOINT_ID}/connection-string" \
      -H "Accept: application/json" \
      -H "Authorization: Bearer ${NEON_API_KEY}")
    
    CONNECTION_STRING=$(echo $CONN_RESPONSE | grep -o '"connection_string":"[^"]*' | sed 's/"connection_string":"//g')
    
    if [[ -n "$CONNECTION_STRING" ]]; then
        echo -e "${GREEN}Connection string for ${BRANCH_NAME} branch:${NC}"
        echo "$CONNECTION_STRING"
        
        # Update .env file with new connection string for development
        if [[ -f .env ]]; then
            if grep -q "NEON_DATABASE_URL_DEV=" .env; then
                # Replace existing value
                sed -i '' "s|NEON_DATABASE_URL_DEV=.*|NEON_DATABASE_URL_DEV=${CONNECTION_STRING}|g" .env
            else
                # Add new value
                echo "NEON_DATABASE_URL_DEV=${CONNECTION_STRING}" >> .env
            fi
            echo -e "${GREEN}Added connection string to .env file as NEON_DATABASE_URL_DEV${NC}"
        fi
        
        echo ""
        echo -e "${BLUE}Next steps:${NC}"
        echo -e "1. Use this connection string in your development environment"
        echo -e "2. To use this branch add to .env: ${YELLOW}NEON_DATABASE_URL=${CONNECTION_STRING}${NC}"
        echo -e "3. To use in Vercel for preview deployments, add this variable to the Preview environment"
    else
        echo -e "${RED}Failed to get connection string.${NC}"
    fi
else
    echo -e "${RED}Failed to create branch: ${NC}"
    echo "$RESPONSE_BODY"
fi

echo ""
echo -e "${BLUE}==================================================${NC}"