# Angular Chess

![Angular Chess](/angular-chess/src/assets/chess_3.PNG)

## Demo

[Angular Chess Azure website](http://angular-chess.azurewebsites.net)

## EN 

### Skills

- Multiplayer (with Remote player) / Singleplayer (with Local players)
- Spectators can also join the multiplayer rooms
- Step notation
- Synchronized table and step notation for post-start entrances
- Chat in Multiplayer mode 
- Save/Load game (stored in LocalStorage)

![Angular Chess](/angular-chess/src/assets/chess_5.PNG)

![Angular Chess - chat](/angular-chess/src/assets/chess_6.PNG)

![Angular Chess - load](/angular-chess/src/assets/chess_7.PNG)

### Behavior

Chess pieces are placed on the board as an object through an initialization procedure.
A chessboard is also an object whose cells are assigned an onclick event.
You can move with the pieces by first clicking on the cell containing the piece (From) and then clicking on the cell you want to move on.
You have to move alternately, white can move first.

In the event of an incorrect step or step with an incorrect color, the program will display a message and ignore the step.

#### Castling

You have to move with the bastion and give the cube next to the king as a target. The program will then perform the rake, provided the king is not in chess.

#### En passant
If the pawn advances two from the starting position with the opponent's pawn in front of it and the opponent's pawn is placed next to it, the opponent in the next step (and
only in that step) you can catch the pawn by stepping diagonally behind it from the position next to it. The program processes the capture step as a regular step.

#### Pawn promotion
If the player's pawn reaches the opponent's starting line, you can choose to exchange from the previously lost pieces.
![Pawn promotion](/angular-chess/src/assets/chess_4.PNG)

### Opportunity for further development

- Multilingualism,
- Timer, with separate measurements for each color,
- Email forwarding,
- Built-in situational situations for self-test (chess mat, dead position, dead position),
- Play based on a playlist,
- Display as a Blazor hybrid app using client-side code (for all platforms).

## HU 

### Képességek

- Többjátékos mód (távoli játékossal) / Helyi mód
- Néző is csatlakozhat a többjátékos módú szobákhoz
- Lépésjegyzék
- Szinkronizált tábla és lépésjegyzék a kezdés utáni belépőknél
- Chat a többjátékos módban
- Játék mentése/visszatöltése (LocalStorage alapú tárolás)

![Angular Chess](/angular-chess/src/assets/chess_5.PNG)

![Angular Chess - chat](/angular-chess/src/assets/chess_6.PNG)

![Angular Chess - load](/angular-chess/src/assets/chess_7.PNG)

### Működés

A táblára egy inicializáló eljárás révén elhelyezésre kerülnek a sakkfigurák objektumként.
A sakktábla is egy objektum, aminek a celláihoz van rendelve egy-egy onclick esemény.
A bábukkal úgy lehet lépni, hogy először kattintani kell a bábut tartalmazó cellára (From), majd kattintani kell arra a cellára, amelyikre lépni szándokozunk.
Felváltva kell lépni, először a fehér léphet.

Nem megfelelő lépés, vagy nem felelő színnel történő lépés esetén a program üzenetet jelenít meg, és figyelmen kívül hagyja a lépést.

#### Berosálás (Castling)

A bástyával kell lépni, és a király melletti kockát kell megadni célként. A program ekkor végrehajtja a rosálást, feltéve hogy nem sakkban áll a király.

#### Gyalog elfogás (En passant)
Ha a gyalog a kezdő pozicíóból kettőt lép előre úgy, hogy előtte az ellenfél gyalogja van, és mellé is az ellenfél gyalogja kerül így, akkor az ellenfél a következő lépésben (és 
csak abban a lépésben) el foghatja a gyalogot úgy, hogy a mellete lévő pozicióból átlósan mögé lép. A program az elfogás lépését szabályos lépésként dolgozza fel.

#### Gyalog csere (Pawn promotion)
Ha a játékos gyalogja beér az elenfél kiinduló sorába, akkor a korábban elvesztett bábuk közül választhat cserét.
![Pawn promotion](/angular-chess/src/assets/chess_4.PNG)

### Továbbfejlesztési lehetőség

- Többnyelvűsítés,
- Időmérő, színenként külön méréssel,
- Mentés továbbítása email-en,
- Beépített szituációs helyzetek önteszt-hez (sakk matt, patt helyzet, dead position),
- Lépéslista alapján visszajátszás,
- Blazor hybrid app-ként történő megjelenítés a kliens oldali kódot felhasználva (minden platformra).
 