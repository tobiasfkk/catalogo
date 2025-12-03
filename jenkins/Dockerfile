FROM jenkins/jenkins:lts-jdk21

# Instalar plugins essenciais
COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt