# Attendance-Barcode-Scanner

A simple attendance scanner that uses a webcam to scan a barcode containing a 9 digit student ID and then mark log in and log out times in a SQL database.

**NOTE: THIS IS A WORK IN PROGRESS**

## Installation
Install [Node.js](https://nodejs.org/) 16 or higher.

```shell
git clone https://github.com/JackOutTheBox124/Attendance-Barcode-Scanner.git
cd Attendance-Barcode-Scanner
npm install
```

Install MySQL workbench and create a database called `attendance` and a table called `students` with the utf8 charset and the InnuDB Engine, with the following columns:
* id SMALLINT(11) PK, UQ
* timestamps MEDIUMTEXT NN,
* lastLogin BIGINT(20) NN, DEFAULT 0

Update the constants.ts file with your database credentials, the port you want to run the server on, as well as the remaining options you want to set for sorting


Install [PuTTY](https://www.putty.org/)

Install [FileZilla Client](https://filezilla-project.org/) 

Pay attention while installing FileZilla Client as the installer may contain adware. See [This Medium article](https://medium.com/web-design-web-developer-magazine/how-to-safely-download-and-cleanly-install-filezilla-ftp-software-with-no-additional-junk-10b27a2d270d) by Jim Dee for more information

## Downloading Data From PI
Open PuTTY and type the hostname or the IP address of the Raspberry Pi you are running the attendance system on in the `Host Name (or IP address)` field near the top in the `Session` category. Ensure you type `22` in the `Port` field and have `SSH` as the selected Connection Type.

When you are ready to connect, click on the `Open` Button at the bottom.
Once you have connected, you will need to log in using the username and password you set

Then you can 
```shell

```

Once those commands have been ran, you can now close PuTTY.

Open FileZilla and type the hostname or the IP address of the Raspberry Pi into the `Host` field and enter your username and password in their respective fields. Ensure the `Port` field's value is `22`. Then click `Quickconnect` at the right.

You can click and drag the file you created in the previous step from the `Remote Site` window into whichever folder you wish in the `Local Site` window to download the file.

Next, open MySQL Workbench and open the MariaDB connection you created earlier. Then click on the `Data Import/Restore` tab. Click `Import from Self-Contained File` and select the file you downloaded in the previous step and set the `Default Target Schema` to `attendance`. Then click `Start Import`.


## Uploading Downloaded Data to Google Sheets
Open the command prompt and navigate to where you have installed the directory.
```shell
npm run upload
```
When finished, press `ctrl` + `c` to exit the program.



# BELOW NOT FINISHED
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
