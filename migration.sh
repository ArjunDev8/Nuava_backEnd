#!/bin/bash

# Run Prisma migration
npx prisma migrate dev --name added_two_new_Attributes_to_fixture_table

# Generate Prisma client
npx prisma generate

# Execute command inside Docker container
docker exec -it c613d3fe64a3 sh -c 'cd /usr/src/node-app && npx prisma generate'

# Run yarn postmigrate
yarn postmigrate