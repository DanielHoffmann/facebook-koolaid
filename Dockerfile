FROM node:argon
RUN mkdir -p /var/www
WORKDIR /var/www
COPY . /var/www
RUN npm install
RUN npm install nodemon -g
RUN npm install node-inspector -g
EXPOSE 3000
EXPOSE 5858
EXPOSE 9080
EXPOSE 5432
