## Database Migration and Prisma Client Generation

We use Prisma for database migrations and client generation. To run a migration and generate the Prisma client, we have a bash script that automates these steps.

### Prerequisites

- Ensure you have Prisma CLI and Docker installed and available in your PATH.

### Steps

1. Save the following script to a file in your project root, for example, `migrate.sh`:

   ```bash
   #!/bin/bash

   # Run Prisma migration
   npx prisma migrate dev --name name-your-migration

   # Generate Prisma client
   npx prisma generate

   # Execute command inside Docker container
   docker exec -it [node-docker-container-id] sh -c 'cd /usr/src/node-app && npx prisma generate'
   ```

2. Give the script execute permissions:

   ```bash
   chmod +x migrate.sh
   ```

3. Run the script:

   ```bash
   ./migrate.sh
   ```

This script does the following:

- Creates a new migration based on the changes in your Prisma schema and applies it to your database.
- Generates Prisma Client based on your updated Prisma schema.
- Starts a shell inside your Docker container.
- Changes the current directory to your project directory inside the Docker container.
- Generates Prisma Client inside the Docker container.

Please note that you need to have Prisma CLI installed in your Docker container to be able to run `npx prisma generate` inside the container. If it's not installed, you can add `RUN npm install @prisma/cli --global` to your Dockerfile to install it.

<!-- Student pass: pasdaskdjskdj -->
<!-- email: hussainsamar36@gmail.com -->
# nuava-sports-project
