FROM node:argon
RUN mkdir -p /var/www
WORKDIR /var/www
COPY . /var/www
EXPOSE 5432
