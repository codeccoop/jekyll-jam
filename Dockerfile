FROM php:7.4-apache

# Enable modules
RUN a2enmod ssl
RUN a2enmod headers
RUN a2enmod rewrite

# SSL Certificates
RUN apt update && apt install -y openssl
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/apache-selfsigned.key -out /etc/ssl/certs/apache-selfsigned.crt -subj "/C=ES/ST=Barcelona/L=Spain/O=Codec/OU=Developers/CN=jekyll-jam.codeccoop.org"

# Enable configs
COPY .apache/ssl-params.conf /etc/apache2/conf-available/ssl-params.conf
RUN a2enconf ssl-params

# Enable SSL default site
COPY .apache/default-ssl.conf /etc/apache2/sites-available/default-ssl.conf
RUN a2ensite default-ssl

RUN echo "ServerName jekyll-jam.codeccoop.org" >> /etc/apache2/apache2.conf
