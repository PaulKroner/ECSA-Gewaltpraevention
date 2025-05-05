# Gewaltpräventionstool des [EC Sachsen-Anhalt e.V.](https://ecsa.de/)

Die Anwendung ermöglicht das Abrufen, Anlegen, Bearbeiten und Löschen von Mitarbeitern sowie deren Nachweisen (z. B. Polizeiliches Führungszeugnis).\
Sobald ein Nachweis abläuft oder nachgereicht werden muss, werden automatisch E-Mail-Benachrichtigungen an die betroffenen Mitarbeiter versendet. Zudem ist ein Authentifizierungssystem mit Rollenverwaltung für Administratoren und Mitarbeiter implementiert, das auf JWT basiert.\
Das Frontend wurde mit React.js entwickelt, während das Backend in PHP realisiert wurde. Die Anwendung nutzt eine MySQL-Datenbank.\
Verwendete Libraries sind [Shadcn UI](https://ui.shadcn.com/), [JWT](https://auth0.com/de/learn/json-web-tokens), [TailwindCSS](https://tailwindcss.com/), [Axios](https://axios-http.com/docs/intro) und [PHPMailer](https://github.com/PHPMailer/PHPMailer).


## .env Backend

### Datenbank Konfiguration
DB_HOST=`URL_ZUR_DATENBANK`\
DB_NAME=`DATENBANK_NAME`\
DB_USER=`USERNAME`\
DB_PASS=`PASSWORT`\
DB_PORT=`PORT` --> wird nur benötigt, falls [MAMP](https://www.mamp.info/de/windows/) genutzt wird.

### SMTP Mail Konfiguration
MAIL_HOST=`mail.dein-server.de`\
MAIL_PORT=`123`
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

### MAMP Installation

Gehe auf [MAMP installieren](https://www.mamp.info/de/windows/) und folge den Schritten.
Der Ordner `Backend`muss in den Ordner `htdocs`. Über das User Interface von Xampp kann der Apache Server gestartet werden. Die MySQL Datenbank wird automatisch gestartet.\
Die URL ist dann `http://localhost:8889/backend/datei`.
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

### .env Frontend

`VITE_GP_EDV_API_URL=http://localhost:8889/backend/api`\
Für die Entwicklung der App muss der Pfad, der z.B. in [Xampp](https://www.apachefriends.org/de/index.html) oder [MAMP](https://www.mamp.info/de/windows/) hinterlegt ist, angegeben werden.\
`Localhost` muss dann für die Production geändert werden, z.B. in `https://dein-server.com/api/`.

`VITE_RECAPTCHA_SITE_KEY`=`reCaptchaSiteKey`

## Scripts

### `npm install` *Wichtig für Entwicklung*
Installiert die benötigten Packages.

### `npm run dev` *Wichtig für Entwicklung*
Startet die App im Entwicklungsmodus.\
In der URL des Browsers muss [http://localhost:5173](http://localhost:5173) eingeben werden, um die App zu sehen.\
Die Seite aktualisiert Änderungen automatisch. Syntax Fehler können in der Console oder in den Browser Dev Tools eingesehen werden.

### `npm run build` *Wichtig für Server*

Erstellt die App für die Produktion auf dem Server im Ordner `build`.  
Die Dateien im `Dist`-Ordner müssen dann nur noch auf den Webserver hochgeladen werden.