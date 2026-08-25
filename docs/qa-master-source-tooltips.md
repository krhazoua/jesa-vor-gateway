# Engineering data-source tooltip QA

The Configuration status banner now uses keyboard-focusable Radix tooltip triggers for both `LOCAL AUTHORITATIVE DATASET` and `NOT CONFIGURED`.

The local tooltip explains that canonical equipment and variable records are read from the local database and are authoritative for the prototype. The production-adapter tooltip explains that no production endpoint, credentials, or external master connection is configured, and that the gateway remains local-data and read-only.

Desktop and mobile authenticated captures confirm that the status banner remains readable, the two status meanings remain distinct, and the tooltip triggers do not change connection or plant-write behavior.
