# AngularChess

## Ikonok (HU)

Material ikonjai kerültek felhasználásra a következők szerint:

- Paraszt  \- person
- Bástya   \- settings 
- Csikó    \- savings
- Futó     \- account_circle
- Királynő \- grade
- Király   \- engineering

## Icons (EN)

Material icons were used as follows:

- Peasant  \- person
- Bastion  \- settings 
- Colt     \- savings
- Runner   \- account_circle
- Queen    \- grade
- King     \- engineering

## Működés

A táblára egy inicializáló eljárás révén elhelyezésre kerülnek a sakkfigurák objektumként.
A sakktábla is egy objektum, aminek a celláihoz van rendelve egy-egy onclick esemény.
A bábukkal úgy lehet lépni, hogy először kattintani kell a bábut tartalmazó cellára (From), majd kattintani kell arra a cellára, amelyikre lépni szándokozunk.
Felváltva kell lépni, először a fehér léphet.

Nem megfelelő lépés, vagy nem felelő színnel történő lépés esetén a program üzenetet jelenít meg, és figyelmen kívül hagyja a lépést.

## Továbbfejlesztési lehetőség

- A lépések listaszerű megjelenítése a játék végéig,
- A lépések sakkjátékok hivatalos jelölésével történő megjelenítése,
- Beépített Chat ablakon keresztül, az üzenetekkel vezérelt játék (kattintás alapú vezérlés mellett),
- Blazor hybrid app-ként történő megjelenítés a kliens oldali kódot felhasználva (minden platformra),
- Saját ikonkészlet. 
 