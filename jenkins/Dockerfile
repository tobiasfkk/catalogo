FROM jenkins/jenkins:lts-jdk21

# Instalar Docker CLI e docker-compose
USER root
RUN apt-get update && apt-get install -y \
    docker.io \
    curl \
    && curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose \
    && chmod +x /usr/local/bin/docker-compose \
    && rm -rf /var/lib/apt/lists/*

# Voltar para usuário jenkins
USER jenkins

# Instalar plugins essenciais
COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt