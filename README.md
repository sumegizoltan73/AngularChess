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

### K??pess??gek

- T??bbj??t??kos m??d (t??voli j??t??kossal) / Helyi m??d
- N??z?? is csatlakozhat a t??bbj??t??kos m??d?? szob??khoz
- L??p??sjegyz??k
- Szinkroniz??lt t??bla ??s l??p??sjegyz??k a kezd??s ut??ni bel??p??kn??l
- Chat a t??bbj??t??kos m??dban
- J??t??k ment??se/visszat??lt??se (LocalStorage alap?? t??rol??s)

![Angular Chess](/angular-chess/src/assets/chess_5.PNG)

![Angular Chess - chat](/angular-chess/src/assets/chess_6.PNG)

![Angular Chess - load](/angular-chess/src/assets/chess_7.PNG)

### M??k??d??s

A t??bl??ra egy inicializ??l?? elj??r??s r??v??n elhelyez??sre ker??lnek a sakkfigur??k objektumk??nt.
A sakkt??bla is egy objektum, aminek a cell??ihoz van rendelve egy-egy onclick esem??ny.
A b??bukkal ??gy lehet l??pni, hogy el??sz??r kattintani kell a b??but tartalmaz?? cell??ra (From), majd kattintani kell arra a cell??ra, amelyikre l??pni sz??ndokozunk.
Felv??ltva kell l??pni, el??sz??r a feh??r l??phet.

Nem megfelel?? l??p??s, vagy nem felel?? sz??nnel t??rt??n?? l??p??s eset??n a program ??zenetet jelen??t meg, ??s figyelmen k??v??l hagyja a l??p??st.

#### Beros??l??s (Castling)

A b??sty??val kell l??pni, ??s a kir??ly melletti kock??t kell megadni c??lk??nt. A program ekkor v??grehajtja a ros??l??st, felt??ve hogy nem sakkban ??ll a kir??ly.

#### Gyalog elfog??s (En passant)
Ha a gyalog a kezd?? pozic????b??l kett??t l??p el??re ??gy, hogy el??tte az ellenf??l gyalogja van, ??s mell?? is az ellenf??l gyalogja ker??l ??gy, akkor az ellenf??l a k??vetkez?? l??p??sben (??s 
csak abban a l??p??sben) el foghatja a gyalogot ??gy, hogy a mellete l??v?? pozici??b??l ??tl??san m??g?? l??p. A program az elfog??s l??p??s??t szab??lyos l??p??sk??nt dolgozza fel.

#### Gyalog csere (Pawn promotion)
Ha a j??t??kos gyalogja be??r az elenf??l kiindul?? sor??ba, akkor a kor??bban elvesztett b??buk k??z??l v??laszthat cser??t.
![Pawn promotion](/angular-chess/src/assets/chess_4.PNG)

### Tov??bbfejleszt??si lehet??s??g

- T??bbnyelv??s??t??s,
- Id??m??r??, sz??nenk??nt k??l??n m??r??ssel,
- Ment??s tov??bb??t??sa email-en,
- Be??p??tett szitu??ci??s helyzetek ??nteszt-hez (sakk matt, patt helyzet, dead position),
- L??p??slista alapj??n visszaj??tsz??s,
- Blazor hybrid app-k??nt t??rt??n?? megjelen??t??s a kliens oldali k??dot felhaszn??lva (minden platformra).
 