#!/bin/bash

# Run Prisma migration
npx prisma migrate dev --name add_gender_to_the_tournament_table

# Generate Prisma client
npx prisma generate

# Execute command inside Docker container
docker exec -it 76dd4cc1631a sh -c 'cd /usr/src/node-app && npx prisma generate'

# Run yarn postmigrate
yarn postmigrate