# update ubuntu
apt-get update
apt-get dist-upgrade

# update Nodejs
npm cache clean -f
npm install -g n
n stable

# install applications
apt-get install -y npm
apt-get install -y p7zip-full
apt-get install -y unzip
apt-get install -y htop
apt-get install -y git
apt-get install -y vim

# quietly add a user without password
adduser --quiet --disabled-password -shell /bin/bash --home /home/raza --gecos "User" raza

# set password
echo "raza:cc" | chpasswd

# add raza to sudoers
sudo adduser raza sudo

# login as raza
su - raza

curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer
chmod -R 777 /usr/local/bin/

# download bashrc and loads bashrc
git clone https://github.com/rationalthinker1/bashrc.git
cd bashrc/
mv -f .* ~/
cd
source ~/.bashrc
rm -rf bashrc/

# download phone
git clone https://github.com/rationalthinker1/phone.git

# download dropbox uploader
https://github.com/andreafabrizi/Dropbox-Uploader.git

echo "cc" | sudo -S -v
cd phone
sudo npm install

git config --global user.email "razaf88@gmail.com"
git config --global user.name "Raza Farooq"
