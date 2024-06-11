#!/bin/bash

# Run Prisma migration
npx prisma migrate dev --name added token to the coach and student table

# Generate Prisma client
npx prisma generate

# Execute command inside Docker container
docker exec -it 881198e736d7 sh -c 'cd /usr/src/node-app && npx prisma generate'