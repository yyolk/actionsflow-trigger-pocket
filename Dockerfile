FROM node:16
WORKDIR /work
COPY src/ ./src/
COPY package.json .
COPY .npmignore .
COPY tsconfig.* .
ENTRYPOINT "/bin/bash"
CMD ""