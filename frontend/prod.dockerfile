ARG USER_ID
ARG GROUP_ID

FROM node:22.16-alpine

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Create and set ownership of the working directory
RUN mkdir -p /code && chown appuser:appgroup /code

WORKDIR /code

COPY --chown=appuser:appgroup . /code/
