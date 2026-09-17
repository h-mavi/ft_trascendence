-- Dati di riferimento: preferenze, abilita' e pezzi.
-- L'abilita' di ogni pezzo e' risolta per nome e non per id: id_ability e'
-- autoincrement, quindi gli id dipendono dall'ordine di inserimento e non
-- possono essere scritti a mano senza legarsi a un database specifico.

INSERT INTO public.preferences (name) VALUES
	('DarkRed'),
	('DarkBlue'),
	('DarkGreen'),
	('DarkYellow');

INSERT INTO public.abilities (name,description) VALUES
	('Giuramento','Dopo il movimento può spostarsi una seconda volta a patto che non sorpassi la linea di proiezione minacciata da un''altro pezzo'),
	('Ultimo a cadere','"Che tipo di re sarai?" e'' una domanda a cui sei portato a rispondere, 
	e cio'' ti infondera'' una forza micidiale nel momento in cui rimarrai da solo nel campo di battaglia.'),
	('Berserk','Questa abilita'' permette ad un minotauro di attaccare un altro bersaglio nelle caselle di movimento dopo aver catturato un pezzo.'),
	('Scherzo','Il giullare puo'' usare lo spazio a suo piacimento, uscire dalla scacchiera e rientrare dalla parte opposta'),
	('Investitura','I bastardi che vengono investiti della carica di lord (minore) possono comandare ai pezzi adiacenti di muoversi al loro comando,
	oppure muoversi di due caselle.'),
	('Lancio','La valchiria lancia la il suo giavelotto, quindi riesce ad abbattere i pezzi nemici (potendo saltare anche un pezzo) senza doversi muovere.');

INSERT INTO public.pieces (name,"cost",id_ability,info,lore,"quote") VALUES
	('Giullare',5,(SELECT id_ability FROM public.abilities WHERE name = 'Scherzo'),'Il giullare si muove ad L, 2 in una direzione e 1 nella direzione perependicolare saltando i pezzi che si trovano sul suo percorso.','Se hai intenzione di dare un banchetto, i giullari non possono mancare.
	Li vedrai spesso scappare a zig-zag evitando i sassi lanciati dai bambini grassottelli di qualche sir o lord.
	Le loro vesti sgargianti e troppo strette mettevano anche il re Blu di buon umore.
	Aveva ancora un largo sorriso quando i giullari recapitarono la sua testa al re Rosso.
	Fuori dalle corti nessuno si sognerebbe mai di rivolgergli neanche uno sguardo.
	Molte madri del regno giurano di averne visto uno rubarle il figlio dopo il parto. Ma sono solo storielle, probabilmente...
	Oltre il mare vengono chiamati "gli occhi del Rosso".','Cosa fanno i giullari quando nessuno li guarda? Ti ascoltano.'),
	('Valchiria',3,(SELECT id_ability FROM public.abilities WHERE name = 'Lancio'),'La valchiria si muove in diagonale.','Le valchirie nascono come un gruppo di donne sopravissute alla Grande Guerra che ha devastato le regioni occidentali, lasciando campi un tempo rigogliosi pieni zeppi di cadaveri.
	Le valchirie si unirono in una società matriarcale che vaga di battaglia in battaglia per dare asilo ai sopravvissuti.
	I contrasti con grupi mercenari erano frequenti, fu per questo che svilupparono un nuova branca della medicina, grazie anche all''aiuto della magia oscura.
	Queste tecniche permisero loro di usare i morti come pezzi di ricambio, cosa che fece perdere di vista la loro missione orginiraria.
	Da sopravvissute che erano ora sono dei macabri ammassi di carne alla ricerca di corpi da usare nei loro rituali.
	Attualmente due schieramenti di valchirie sono stati avvistate che si dirigevano al campo di battaglila tra i due principi, non si preannuncia un bello spettacolo...','Valchirie...donne che cadono a pezzi...letteralmente.'),
	('Sovrano',0,(SELECT id_ability FROM public.abilities WHERE name = 'Ultimo a cadere'),'Il re si puo'' muovere di una casella in ogni direzione fin tanto che non si trova sotto il tiro dei pezzi rivali.','Figli del vecchio re Rosso, i gemelli Bianco e Nero hanno vissuto una vita agiata, senza le frivole preoccupazioni dei semplici .
	Dopo che il re Rosso morì per la puntura di un''ape, non lasciano chiare indicazioni per un erede,
	i due si catapultarono in battibecchi degni dei bambini più viziati.
	Il principe Bianco, non contento di essersi coperto di ridicolo fino ad allora, decise di muovere guerra contro suo fratello Nero.
	Che tipo di re si ritroverà il regno è una domanda a cui non tutti troveranno risposta, 
	la cosa certa è che faranno di tutto pur di non permettere all''altro di vincere questa disputa.','''Bianco o Nero'' mi chiedono. Ho meglio da fare.'),
	('Campione',10,(SELECT id_ability FROM public.abilities WHERE name = 'Giuramento'),'Il campione si muove in ogni direzione per la distanza che vuole','I Campioni non sono solo valorosi guerrieri scelti dal re come scorta, ma sono dei veri e propri simboli di forza.
	Alti, forti, veloci, letali e decisamente di poche parole, ogni cavaliere che si rispetti ha questo titolo come ambizione e spesso
	giostrano e combattono in tornei e guerriglie per dimostrarsi degni. 
	La verita'' e'' che nessuno di loro lo potra'' mai essere.
	Le origni dei Campioni sono piu'' oscure di quanto si pensa, i candidati non vengono scelti tra semplici cavalieri, ma vengono 
	presi e cresciuti da famiglie la cui geneologia viene controllata da tempo. Dopodiche'' i candidai vengono sottoposti a durissimi 
	addestramenti, che sono piu'' simili a torture, ed a numerosi rituali di magia per sviluppare i loro potenziale.
	Come ultimo passo il Campione, dopo avere dato prova del suo valore in battaglia o in altri incarichi, si deve mozzare la lingua 
	di fronte al sovrano, in segno di fedelta'' ed in modo che non possa rivelare i suoi segreti.','Forti, robusti e con una posizione di rilievo. Se fossero anche simpatici ti ruberebbero la moglie.'),
	('Minotauro',5,(SELECT id_ability FROM public.abilities WHERE name = 'Berserk'),'I minotauri si muovo avanti, indietro e di lato caricando il loro bersaglio.','I minotauri sono abomini creati sotto diretto ordine del re Rosso.
	Sono i risultati degli esperimenti che univano la manipolazione genetica tramite imbreeding, pratica che da secoli veniva fatta
	su cani, cavalli, bestiame, piante e, in casi più specifichi anche su certi individui, e la magia del sangue proveniente dalle terre dell''est.
	Questi esperimenti diedero vita a delle chimere con un corpo da uomo, zoccoli e testa da toro.
	Il piano iniziale era quello di usarli come ..., tuttavia la loro straordinaria forza si rese un ''ottimo 
	intrattenimento per i reali.
	La loro aggressività è dovuta al fatto che i primi casi di ibridi riusciti erano affetti da un grave caso di schizzofrenia,
	dovuta alla loro spiccata paraidolia, che gli provoca continue emicranie, 
	ecco spiegato anche il motivo per cui sono soliti caricare con a testa bassa qualsiasi cosa sia davanti a loro.','Mostri del cazzo creati da altri mostri del cazzo'),
	('Bastardo',1,(SELECT id_ability FROM public.abilities WHERE name = 'Investitura'),'I bastardi si muovono di una casella in avanti (o 2 se non si sono mai mossi), possono mangiare pezzi di 1 un diagonale.
	Arrivati alla fine della scacchiera i bastardi possono trasformarsi in un pezzo qualsiasi.','I figli bastardi dei principi, avuti probabilmente da qualche amante o da qualche figlia libertina di un lord minore,
	che sia per sua volonta'' o per far ottenere un favore a suo padre.
	All''inizio della guerra i bastardi sono stati costretti a schierarsi ed a prendere le armi in farvore del loro "padre", 
	anche se per molti e'' difficile dire chi sia, preferiscono le prospettive di un futuro roseo in cui vengono ricompensati 
	per il loro coraggio, nella remota possibilita'' che non vengano catturati, fatti a pezzi o entrambe.
	Usa la tua prole bastarda come carne da macello per apire brecce nella difesa di tuo fratello, nessuno ne sentira'' comunque la mancanza.','Non avere pieta'' di loro. Sono solo dei bastardi, dopotutto.');
