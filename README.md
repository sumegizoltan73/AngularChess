# AngularChess

![Angular Chess](/angular-chess/src/assets/chess_3.PNG)

## Működés

A táblára egy inicializáló eljárás révén elhelyezésre kerülnek a sakkfigurák objektumként.
A sakktábla is egy objektum, aminek a celláihoz van rendelve egy-egy onclick esemény.
A bábukkal úgy lehet lépni, hogy először kattintani kell a bábut tartalmazó cellára (From), majd kattintani kell arra a cellára, amelyikre lépni szándokozunk.
Felváltva kell lépni, először a fehér léphet.

Nem megfelelő lépés, vagy nem felelő színnel történő lépés esetén a program üzenetet jelenít meg, és figyelmen kívül hagyja a lépést.

### Berosálás (Castling)

A bástyával kell lépni, és a király melleti kockát kell megadni célként. A program ekkor végrehajtja a rosálást, feltéve hogy nem sakkban áll a király.

### Gyalog elfogás (En passant)
Ha a gyalog a kezdő pozicíóból kettőt lép előre úgy, hogy előtte az ellenfél gyalogja van, és mellé is az ellenfél gyalogja kerül így, akkor az ellenfél a következő lépésben (és 
csak abban a lépésben) el foghatja a gyalogot úgy, hogy a mellete lévő pozicióból átlósan mögé lép. A program az elfogás lépését szabályos lépésként dolgozza fel.

## Továbbfejlesztési lehetőség

- A lépések listaszerű megjelenítése a játék végéig,
- A lépések sakkjátékok hivatalos jelölésével történő megjelenítése,
- Beépített Chat ablakon keresztül, az üzenetekkel vezérelt játék (kattintás alapú vezérlés mellett),
- Blazor hybrid app-ként történő megjelenítés a kliens oldali kódot felhasználva (minden platformra).
 