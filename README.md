# Attendance-Barcode-Scanner

A simple attendance scanner that uses a webcam to scan a barcode containing a 9 digit student ID and then mark log in and log out times in a SQL database.

**NOTE: THIS IS A WORK IN PROGRESS**

## Installation
Install [https://nodejs.org/](Node.js) 16 or higher.

```shell
git clone https://github.com/JackOutTheBox124/Attendance-Barcode-Scanner.git
cd Attendance-Barcode-Scanner
npm install
```
## Raspberry PI Setup
You can install MariaDB using the APT package repository.
Update the package manager if you have not done so recently
```shell
sudo apt update
```
Next, install the MariaDB package
```shell
sudo apt install mariadb-server
```
