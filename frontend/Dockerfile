    # Use an official Bun image as the base
    FROM oven/bun:latest

    # Set the working directory inside the container
    WORKDIR /app

    # Copy package.json and bun.lockb to leverage Docker's cache
    COPY package.json bun.lockb ./

    # Install dependencies using Bun
    RUN bun install

    # Copy the rest of your application files
    COPY . .

    # Build your Bun project (if needed, e.g., for a Next.js app)
    # RUN bun run build

    # Expose the port your application listens on (e.g., 3000)
    EXPOSE 8080

    # Command to run your application when the container starts
    CMD ["bun", "run", "dev"]