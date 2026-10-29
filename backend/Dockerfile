FROM node:20-alpine

# Security hardening: Update OS packages to patch vulnerabilities
RUN apk update && apk upgrade --no-cache

# Create non-root group and user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy application files
COPY . .

# Set ownership of application files to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user for principle of least privilege
USER appuser

EXPOSE 5000

CMD ["node", "server.js"]
