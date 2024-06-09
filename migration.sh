#!/bin/bash

# Run Prisma migration
npx prisma migrate dev --name added_passkey_to_school

# Generate Prisma client
npx prisma generate

# Execute command inside Docker container
docker exec -it 1a2c72db713e sh -c 'cd /usr/src/node-app && npx prisma generate'