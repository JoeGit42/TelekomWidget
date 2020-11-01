# iOS-Widget für Datenverbrauch im Telekom-Netz
### Forked from [LupusArgentum/TelekomWidget](https://github.com/LupusArgentum/TelekomWidget)
### (Which was forked from [Sillium/telekom.js](https://gist.github.com/Sillium/f904fb89444bc8dde12cfc07b8fa8728))

![IMG_0491](https://user-images.githubusercontent.com/14128113/97805206-02d14880-1c55-11eb-907c-b1c4d08396ba.jpeg)
![IMG_0492](https://user-images.githubusercontent.com/14128113/97805208-04027580-1c55-11eb-8356-9091424a150c.jpeg)

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
