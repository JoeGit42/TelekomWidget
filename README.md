# iOS-Widget für Datenverbrauch im Telekom-Netz
### Forked from [LupusArgentum/TelekomWidget](https://github.com/LupusArgentum/TelekomWidget)
### (Which was forked from [Sillium/telekom.js](https://gist.github.com/Sillium/f904fb89444bc8dde12cfc07b8fa8728))

![](screen.mov) 

Oben im Code gibt es diverse Schalter um zwischen unterschiedlichen Funktionssweisen zu wechseln.
Diese kann jeder für sich individuell auf `true` oder `false` setzen. Abhängigkeiten zwischen den Schaltern gibt es keine.

### Bugs

### Fixes

### InitialChanges (01.11.2020)

Basierend auf dem Fork von [LupusArgentum](https://github.com/LupusArgentum) habe ich ein paar Änderungen vorgenommen:

- Speichern der letzten Sync-Zeit (LupusArgentum hat das bereits parallel implementiert - allerdings leicht anders)
=> Ich speichere direkt im JSON statt einer separaten Datei
- Schalter um die rote/grüne Einfärbung der restlichen Laufzeit zu unterdrücken: `colorTimeToSignalEndOfMonth`
- Schalter um die Anzeige im WLAN zu unterdrücken, dass die API nicht erreicht wurde `showIndicationIfAPIOffline`. (orangener Text) => Stattdessen wird nun die letzte Aktualisierung orange eingefärbt, wenn älter als 1 Tag
- Schalter um das noch verfügbare (statt dem verbrauchten) Volumen anzuzeigen: `showAvailableVolume`
- Erweiterung der DataPassName-Texte um Texte, die nur aus einem Zeichen bestehen (z.B. bei HIGH Mobile)
- Erweiterung der Einfärbungen um dynamische (statt statischer) Grenzen. Das verfügbare Volumen wird nun ins Verhältnis gesetzt zur restlichen Laufzeit des Monats
- Optimierung im Bereich der Texte/Textlängen

### ChangeLog
- 2020-11-03 ADD: Antennen-Symbol oben links (habe ich bei [olikdesign](https://github.com/olikdesign) gesehen) (erstmal deaktiviert, da dies im dark mode nicht funktioniert)
- 2020-11-03 ADD: Beschreibung der Schalter im Code eingefügt
- 2020-11-03 CHG: Bei der Restlaufzeit werden erst Stunden angezeigt, wenn diese weniger als 5 Tage beträgt. Vorher dürften die Stunden nicht wirklich interessant sein.
- 2020-11-14 ADD: Fortschrittsbalken hinzugefüht der das verbrauchte Datenvolumen anzeigt und die Position im Monat an der man sich aktuell befindet. (passend zum Abrechnugnszeitraum)
- 2020-11-14 CHG: Antennen-Symbol funktioniert nun auch im Dark-Modus
