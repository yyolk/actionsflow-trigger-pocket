FROM node:16
WORKDIR /work
COPY src/ ./src/
COPY package.json .
# COPY package-lock.json .
COPY .npmignore .
COPY tsconfig.* .
RUN chown -R 1000:1000 /work
USER node
ENTRYPOINT "/bin/bash"
CMD ""