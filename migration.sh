#!/bin/bash

# Run Prisma migration
npx prisma migrate dev --name making_school_name_unique

# Generate Prisma client
npx prisma generate

# Execute command inside Docker container
docker exec -it 3aa09cbbea8d sh -c 'cd /usr/src/node-app && npx prisma generate'

# Run yarn postmigrate
yarn postmigrate