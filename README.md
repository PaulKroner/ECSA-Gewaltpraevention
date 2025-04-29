# Backend zum Gewaltpräventionstool des [EC Sachsen-Anhalt e.V.](https://ecsa.de/)

Die Anwendung ermöglicht das Abrufen, Anlegen, Bearbeiten und Löschen von Mitarbeitern sowie deren Nachweisen (z. B. Polizeiliches Führungszeugnis).\
Sobald ein Nachweis abläuft oder nachgereicht werden muss, werden automatisch E-Mail-Benachrichtigungen an die betroffenen Mitarbeiter versendet. Zudem ist ein Authentifizierungssystem mit Rollenverwaltung für Administratoren und Mitarbeiter implementiert, das auf JWT basiert.\
Das Frontend wurde mit React.js entwickelt, während das Backend in PHP realisiert wurde. Die Anwendung nutzt eine MySQL-Datenbank.\
Verwendete Libraries sind [Shadcn UI](https://ui.shadcn.com/), [JWT](https://auth0.com/de/learn/json-web-tokens), [TailwindCSS](https://tailwindcss.com/), [Axios](https://axios-http.com/docs/intro) und [PHPMailer](https://github.com/PHPMailer/PHPMailer)

Für die Frontend Dokumentation siehe: [Frontend Dokumentation](https://github.com/PaulKroner/ec-gp-react/blob/main/README.md).

## Branches

Das Repository enthält zwei Branches, Main und Dev.

Main dient als Production Branch und Dev ist der Entwicklungs Branch, der auf `Localhost` läuft.

## .env Entwicklung

### Datenbank Konfiguration Entwicklung
DB_HOST=`localhost`\
DB_NAME=`DATENBANK_NAME`\
DB_USER=`root`\
DB_PASS=

### SMTP Mail Konfiguration mit Mailhog
MAIL_HOST=`localhost`
MAIL_PORT=`1025`
MAIL_USERNAME=`null`
MAIL_PASSWORD=`null`
MAIL_ENCRYPTION=`null`
MAIL_FROM_ADDRESS=`adresse@mail.de`
MAIL_FROM_NAME=`NAME`

## .env Production

### Datenbank Konfiguration
DB_HOST=`URL_ZUR_DATENBANK`\
DB_NAME=`DATENBANK_NAME`\
DB_USER=`USERNAME`\
DB_PASS=`PASSWORT`

### SMTP Mail Konfiguration
MAIL_HOST=`mail.dein-server.de`\
MAIL_PORT=`123` - hier muss der Port entsprechend angepasst werden\
MAIL_USERNAME=`MAIL_USERNAME`\
MAIL_PASSWORD=`MAIL_SERVER_PASSWORT`\
MAIL_ENCRYPTION=`tls`\
MAIL_FROM_ADDRESS=`adresse@mail.de`\
MAIL_FROM_NAME=`NAME` - ist der Name des Absenders (nicht die Mail-Adresse)

### JWT && reCaptchaSecret Key
JWT_SECRET_KEY=`JWT_SECRET_KEY` - kann eine Abfolge aus zufällig erstellten Ziffern und Buchstaben sein
RECAPTCHA_SECRET_KEY=`RECAPTCHA_SECRET_KEY`

## Entwicklungssetup

### Xampp Installation

Gehe auf [Xampp installieren](https://www.apachefriends.org/de/faq_windows.html) und folge den Schritten.

Der Ordner `Backend`muss in den Ordner `htdocs` von [Xampp](https://www.apachefriends.org/de/index.html) eingefügt werden. Über das User Interface von Xampp können Datenbank und Apache Server gestartet werden.\
Wenn [Xampp](https://www.apachefriends.org/de/index.html) läuft, kann das Backend über `http://localhost/backend/datei.php` aufgerufen werden.\

## Einrichtung MailHog

Zum lokalen Testen der Email-Funktionen wurde [MailHog](https://github.com/mailhog/MailHog) verwendet. Die [Schritte Installation](https://github.com/mailhog/MailHog) kann dem GitHub entnommen werden. Die aktuellsten Versionen sind [hier](https://github.com/mailhog/MailHog/releases) zu finden.\
Gestartet wird es im `Terminal` oder per `.exe` mit

MacOS:\
`mailhog`

Windows:\
`MailHog_windows_amd64.exe` ausführen.

Linux:\
`~/go/bin/MailHog`

Anschließend kann es unter dieser URL im Browser aufgerufen werden:\
`localhost:8025`oder `http://127.0.0.1:8025/`