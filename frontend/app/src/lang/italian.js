export const italian = {
    messages: {
        common: {
            name: "ChessZ",
            search: "Cerca",
            players: "Giocatori",
            tournament: "Torneo | Tornei",
            accept: "Accetta",
            reject: "Rifiuta",
            pending: "In attesa...",
            friend: "Amico | Amici",
            win: "Vittoria | Vittorie",
            lose: "Sconfitta | Sconfitte",
            draw: "Patta | Patte",
            game: "Partita | Partite",
            by: "da",
            or: "o | oppure"
        },
        header: {
            inv: {
                creation: "Creato il {date} @:common.by",
                desc: "Sei stato invitato al @.lower:common.tournament {tourName} creato @:common.by {tourCreator}.<br>Vuoi partecipare?",
                expired: "Invito scaduto",
                friendTitle: "Richiesta di amicizia",
                tourTitle: "Invito ad un torneo",
                tagTitle:   "Il tuo rango è cambiato!",
                friendNotif : "{sender} ti ha inviato una richiesta di amicizia",
                tourNotif: "{sender} ti ha invitato a partecipare al @.lower:common.tournament {tour}",
                tagNotif:   "Il tuo rango è passato a {rank}!"
            },
            notifications: "Notifiche",
            readAll: "Segna tutto come letto",
            zeroNotif: "Nessuna notifica",
            profile: "Profilo",
            settings: "Impostazioni",
            logout: "Logout",
            login: "Accedi"
        },
        menu: {
            userList: "{nUser} utenti trovati per \"",
            online: "Gioca online",
            bot: "Gioca con Bot",
            lBoard: "Classifica",
            codex: "Codex"
        },
        login: {
            val: {
                name: "Nome",
                surname: "Cognome",
                nationality: "Nazionalità",
                theme: "Tema"
            },
            OTP: {
                auth: "Autenticazione OTP",
                desc: "Inserisci le il codice che ti è stato mandato via email.",
                exp: "Scadrà in {date}",
                on: "Attivato",
                off: "Disattivato"
            },
            err: {
                title: "Credenziali errate",
                wrong: "Username o password sbagliate.",
                logged: "Utente già logato.",
                tooMany: 'Fatti troppi tentativi.',
                clone: "Esiste già un utente\ncon queste credenziali",
				username: "Lo username deve avere\nalmeno 4 caratteri",
				email: "Controlla di aver\ninserito un email valida",
				password: "La password deve avere:\n\
							- almeno 8 caratteri\n- un numero\n\
							- una maiuscola\n- una minuscola\n\
							- un carattere speciale ($,%,#...)"
            },
            welcome: "Benvenuto!",
            wellback: "Ben tornato!",
            signIn: "Registrati",
            forgot: "Password dimenticata?",
            loginAcc: "@:header.login col tuo account",
            missingAcc: "Non hai ancora un account?",
            presentAcc: "Hai gia' un account?",
            google: "Continua con Google"
        },
        leaderBoard: {
            title: "Top 10 @.lower:common.players",
            outOf: "su {games}",
            empty: "Nessun giocatore in classifica",
        },
        tournaments: {
            newTour: "Crea un nuovo @.lower:{'common.tournament'}!",
            placeholder: "Nome del @.lower:common.tournament",
            creator: "Creatore del @.lower:{'common.tournament'}:",
            button: "Crea",
            ongoing: "In corso...",
            closed: "Conclusi",
            noTour: "Nessun @.lower:common.tournament"
        },
        userPage: {
            edit: {
                infoU: "Informazioni utente",
                changeAvatar: "Cambia avatar",
                removeAvatar: "Elimina avatar",
                changePwd: "Cambia password",
                newPwd: "Nuova password",
                saveChanges: "Salva le modifiche",
                desc: "La password deve avere almeno 8 caratteri, un numero, una maiuscola, una minuscola e un carattere speciale ($,%,#...)",
                googlePwd_one: "Hai fatto accesso con il tuo account Google e in questo momento non hai una password.",
                googlePwd_two: "Creane una per la tua sicurezza!"
            },
            friendList: "Lista di amici",
            removeFriend: "Elimina amicizia",
            friendRequest: "Richieste d'amicizia",
            pendingRequest: "Nessuna richiesta in attesa",
            matchHistory: "Cronologia delle partite",
            sendRequest: "Manda amicizia"
        },
        game: {
            playPage: {
                title: "Scegli il tuo destino",
				aiTitle: "Sfida la macchina",
                reload: "Ricaricando la partita",
                opt: {
                    priv: "Private",
                    friend: "Amichevoli",
                    rank: "Ranked",
                    looking: "Alla ricerca d'un avversario"
                },
				ai: {
                    side: {
                        white: "Bianchi",
                        black: "Neri",
                        random: "Casuale",
                        looking: "Risvegliando la macchina"
                    }
                },
                play: "Gioca!",
                cancel: "Annulla"
            },
            ChessBoard: {
                moveHistory:    "Ancora nessun movimento",
                chatHistory:    "Ancora nessun messaggio",
                chatPrompt:     "Scrivi qui il tuo messaggio...",
                send:           "Invia",
                buttons: {
                    useAbility: "Usa l'abilità!",
                    abilityOn: "Abilità attivata!",
                    endTurn:    "Finisci il turno",
                    boostPiece: "Potenzia il pezzo!",
                    giveUp:     "Abbandona",
                    askDraw:    "Chiedi pareggio",
                    waiting:     "In attesa..."
                }
            }
        },
        allert: {
            title:      "Ci dispiace... :(",
            desc_one:   "A causa delle 3000 informazioni e feature che servono per giocare a",
            desc_two:   "le partite possono essere giocate solo su PC.",
            desc_three:  "Se sei su PC ma vedi comunque questo avviso, prova a de-zoomare la pagina"
        },
        legal: {
            privacy: {
                title:  "Privacy policy",
                desc:   "Questo documento di Privacy Policy descrive come @:{'common.name'}, progetto studentesco 42 Firenze, raccoglie, gestisce e utilizza e protegge i dati personali degli utenti che si registrano ed utilizzano l'applicazione.",
                list:   ["I dati che vengono raccolti in fase di registrazione e per l'utilizzo del servizio sono email, nome, cognome, username, nazionalita, avatar;",
                        "I dati elencati precdentemente vengono utilizzati per autenticazione, gestione amicizie, creazione e gestione tornei/partite, autenticazione a due fattori (2FA);",
                        "Per l'invio codice di verifica che concerne la doppia autenticazione verranno utilizzati provider esterni con servizio SMTP (Google) a cui sarà condivisa l'email;",
                        "Per la registrazione tramite OAuth, saranno condivisi Nome, Cognome e email con servizi esterni (Google);",
                        "L'utente può accedere ai propri dati, modificarli e cancellarli in qualsiasi momento. La cancellazione dell'utenza elimina istantaneamente e in modo definitivo tutti i dati dell'utente.;",
                        "Per proteggere tutte le informazioni personali dell'utente vengono adottate le seguenti misure di sicurezza: hashing della password con salt, autenticazione a due fattori (facoltativa), HTTPS;",
                        "Tutti i dati dell'utente non vengono in alcun modo venduti, o profilati, a fini commerciali"]
            },
            service: {
                title: "Termini di Servizio",
                date:   {   title: "Ultimo aggiornamento:",
                            desc: "10/08/2026" },
                intro:  {   title: "Introduzione",
                            desc_one: "@:common.name è un'applicazione web sviluppata come progetto studentesco nell'ambito del percorso di 42 Firenze, che permette agli utenti di giocare a scacchi in modalita partita online, torneo e partita locale contro AI, gestire un profilo e interagire con altri utenti. Utilizzando il servizio si accetta interamente i presenti \“",
                            desc_two: "\”. Se non si accettano questi termini, si prega di non utilizzare l'applicazione." },
                list:   {
                    "Requisiti di accesso" : "Per utilizzare @:common.name è necessario creare un account fornendo un'email valida e uno username. Per i temi trattati e i termini utilizzati, il servizio è utilizzabile per utenti di età non inferiore ai 14 anni; utenti minorenni dovrebbero utilizzare il servizio con il consenso di un genitore o tutore.",
                    "Comportamento utente" : "Utilizzando @:{'common.name'}, l'utente si impegna a:",
                    "Account" : "L'utente è responsabile della riservatezza delle proprie credenziali di accesso e di tutte le attività svolte tramite il proprio account. @:common.name si riserva il diritto di sospendere o cancellare account che violino queste regole, che presentino attività sospette o fraudolente, o su richiesta dell'utente",
                    "Contenuto generato dall'utente" : "Gli avatar e gli altri contenuti caricati dall'utente rimangono di proprietà dell'utente stesso, che dichiara di possedere i diritti per caricarli. @:common.name si riserva il diritto rimuovere contenuti ritenuti inappropriati, offensivi o in violazione di diritti di terzi, senza preavviso.",
                    "Limitazione responsabilità" : "@:common.name è un progetto realizzato a scopo esclusivamente didattico, nell'ambito del curriculum 42Firenze, senza finalità commerciali. Il servizo è foirnito “as is”, senza garanzie di disponibilità continua, assenza di errori o liovelli di serviuzio (SLA). Gli sviluppatori non sono repsponsabili per eventuali perdite di dati, interruzioni di servizio o danni derivanti dall'utilizzo dell'applicazione.",
                    "Modifiche di termini" : "@:common.name si riserva il diritto di modificare questa pagina Termini di Servizio in qualsiasi momento. Eventuali modifiche sostanziali saranno comunicate agli utenti tramite avviso sull'applicazione o via email. L'uso continuato del servizio dopo una modificacostituisce l'accettazione dei nuovi termini.",
                    "Legge applicabile" : "Questi termini sono regolati dalla legge italiana, in quanto progetto svolto nell'ambito del campus 42 Firenze."
                },
                behavior:   ["Non utilizzare cheat, bot, script di automazione o altre forme di alterazione del normale svolgimento del gioco;",
                            "Non adottare comportamenti offensivi, discriminatori o abusivi nei confronti di altri utenti (in chat, nomi utente o avatar);",
                            "Non tentare di accedere ad account di altri utenti o di compromettere la sicurezza della piattaforma"],
                ban:    "Il mancato rispetto di queste regole può comportare la sospensione o cancellazione dell'account.",
            },
        },
        codex: {
            title: "Le sue abilità",
            move: "Come si muove",
            ability: "Abilità speciale",
            king: {
                name:   "Il Sovrano",
                quote:  "\"'Bianco o Nero' mi chiedono. Ho di meglio da fare.\"",
                lore:   "Figli del vecchio Re Rosso, i gemelli Bianco e Nero hanno vissuto una vita agiata, senza le frivole preoccupazioni dei semplici.\
	                    Dopo che il Re Rosso morì per la puntura di un'ape, non vennero lasciate chiare indicazioni per un erede e\
	                    i due si catapultarono in battibecchi degni dei bambini più viziati.\
	                    Il principe Bianco, non contento di essersi coperto di ridicolo fino ad allora, decise di muovere guerra contro suo fratello Nero.\
	                    Che tipo di Re si ritroverà il regno è una domanda a cui non tutti troveranno risposta, \
	                    la cosa certa è che faranno di tutto pur di non permettere all'altro di vincere questa disputa.",
                move:   "Il Re si può muovere di una casella in ogni direzione fin tanto che non si trova sotto tiro dei nemici.",
                ability: {
                    name:   "Ultimo a cadere",
                    desc:   "\"Che tipo di re sarai?\" è una domanda a cui sei portato a rispondere, \
	                        e ciò ti infonderà una forza micidiale nel momento in cui rimarrai da solo nel campo di battaglia.",
                    cost:   "0"
                }
            },
            champ: {
                name:   "Il Campione",
                quote:  "\"Forti, robusti e con una posizione di rilievo. Se fossero anche simpatici ti ruberebbero la moglie.\"",
                lore:   "I Campioni non sono solo valorosi guerrieri scelti dal Re come scorta, ma sono dei veri e propri simboli di forza.\
	                    Alti, veloci, letali e decisamente di poche parole, ogni cavaliere che si rispetti ha questo titolo come ambizione e spesso\
	                    giostrano e combattono in tornei e guerriglie per dimostrarsi degni. \
	                    Ma la verità è che nessuno di loro potrà mai esserlo.\
	                    Le origni dei Campioni sono più oscure di quanto si pensi: i candidati non vengono scelti tra semplici cavalieri, ma vengono \
	                    presi e cresciuti da famiglie la cui geneologia viene controllata da tempo. Vengono sottoposti a durissimi \
	                    addestramenti, che potrebbero sembrare più delle torture, ed a numerosi rituali di magia per sviluppare il loro potenziale.\
	                    Come ultimo passo il Campione, dopo avere dato prova del suo valore, si deve mozzare la lingua \
	                    di fronte al sovrano, in modo che non possa rivelare i suoi segreti.",
                move:   "Il Campione si muove in ogni direzione, a croce o in diagonale, per la distanza che vuole.",
                ability: {
                    name:   "Giuramento",
                    desc:   "Dopo essersi mosso, il Campione può spostarsi una seconda volta a patto che non si posizioni in un punto minacciato dal nemico.",
                    cost:   "10"
                }
            },
            mino: {
                name:   "Il Minotauro",
                quote:  "\"Mostri del cazzo creati da altri mostri del cazzo.\"",
                lore:   "I Minotauri sono abomini creati sotto diretto ordine del Re Rosso.\
	                    Sono i risultati degli esperimenti che univano la manipolazione genetica tramite imbreeding, praticata da secoli \
	                    su cani, cavalli, piante e, in casi più specifichi, anche su certi individui, e la magia del sangue proveniente dalle terre dell'est.\
	                    Questi esperimenti diedero vita a delle chimere con un corpo da uomo, zoccoli e testa da toro.\
	                    Il piano iniziale era quello di usarli come ..., tuttavia la loro straordinaria forza li rese un ottimo intrattenimento per i reali.\
	                    La loro aggressività è dovuta al fatto che i primi casi di ibridi riusciti erano affetti da un grave caso di schizzofrenia,\
	                    dovuta alla loro spiccata paraidolia, che gli provoca continue emicranie. \
	                    Per questo sono soliti caricare a testa bassa qualsiasi cosa sia davanti a loro.",
                move:   "Il Minotauro si muove a croce caricando il loro bersaglio.",
                ability: {
                    name:   "Berserk",
                    desc:   "Questa abilità permette ad un Minotauro di attaccare un altro bersaglio dopo aver catturato un pezzo.",
                    cost:   "5"
                }
            },
            jester: {
                name:   "Il Giullare",
                quote:  "\"Cosa fanno i giullari quando nessuno li guarda? Ti ascoltano.\"",
                lore:   "Se hai intenzione di dare un banchetto, i Giullari non possono mancare.\
	                    Li vedrai spesso scappare a zig-zag evitando i sassi lanciati dai bambini grassottelli di qualche sir o lord.\
	                    Le loro vesti sgargianti e troppo strette mettevano anche il Re Blu di buon umore.\
	                    Aveva ancora un largo sorriso quando i Giullari recapitarono la sua testa al Re Rosso.\
	                    Fuori dalle corti nessuno si sognerebbe mai di rivolgere loro neanche uno sguardo.\
	                    Molte madri del regno giurano di aver visto alcuni di loro rubare la loro prole dopo il parto.\
	                    Oltre il mare vengono chiamati \"Gli occhi del Rosso\".",
                move:   "Il Giullare si muove ad L, 2 caselle in una direzione e 1 nella direzione perpendicolare alla prima.",
                ability: {
                    name:   "Scherzo",
                    desc:   "Il Giullare può usare lo spazio a suo piacimento, uscire dalla scacchiera e rientrare dalla parte opposta.",
                    cost:   "5"
                }
            },
            valk: {
                name:   "La Valchiria",
                quote:  "\"Valchirie, donne che cadono a pezzi... Letteralmente.\"",
                lore:   "Le Valchirie nascono come un gruppo di donne sopravissute alla Grande Guerra che ha devastato le regioni occidentali, lasciando campi un tempo rigogliosi pieni zeppi di cadaveri.\
	                    Le Valchirie si organizzarono in una società matriarcale che vaga di battaglia in battaglia per dare asilo ai sopravvissuti.\
	                    I contrasti con gruppi mercenari erano frequenti, fu per questo che svilupparono un nuova branca della medicina, grazie anche all'aiuto della magia oscura.\
	                    Queste tecniche permise loro di usare i morti per tappezzare le proprie ferite, cosa che fece perdere di vista la loro missione orginiraria.\
	                    Da sopravvissute che erano sono diventate dei macabri ammassi di carne alla ricerca di corpi da usare nei loro rituali.",
                move:   "La Valchiria si muove in diagonale.",
                ability: {
                    name:   "Lancio",
                    desc:   "La Valchiria può lanciare il suo giavelotto abbattendo i pezzi nemici, potendone saltare anche uno, senza doversi muovere.",
                    cost:   "3"
                }
            },
            bastard: {
                name:   "I Bastardi",
                quote:  "\"Non avere pietà di loro. Sono solo dei bastardi, dopotutto.\"",
                lore:   "I figli bastardi dei principi, avuti probabilmente da qualche amante o da qualche figlia libertina di un lord minore, \
                        per sua volontà o per far ottenere un favore al padre. All'inizio della guerra i Bastardi sono stati costretti a schierarsi \
                        ed a prendere le armi in farvore del loro \"padre\", anche se per molti è difficile dire chi sia dei due. Per loro è più importante \
                        la prospettiva di un futuro roseo in cui vengono ricompensati per il loro coraggio, nella remota possibilità che non vengano catturati, fatti a pezzi o entrambe.\
                        In qualunque caso nessuno ne sentirà la mancanza.",
                move:   "I Bastardi si muovono di una casella in avanti, o di 2 se non si sono mai mossi, e possono mangiare 1 pezzo in diagonale davanti a loro.\
	                    Arrivati alla fine della scacchiera i Bastardi possono trasformarsi in un pezzo qualsiasi.",
                ability: {
                    name:   "Investitura",
                    desc:   "I Bastardi che vengono investiti della carica di lord (minore) possono comandare ai pezzi adiacenti di muoversi al loro comando, anche se solo dopo di loro.",
                    cost:   "1"
                }
            }
        },
        tutorialCodex: {
            baseTitle:  "MOSSA BASE DEGLI SCACCHI",
            king: {
                baseText:   "Si muove di una sola casella per volta, in tutte e otto le direzioni.\nCattura allo stesso modo, spostandosi sulla casella del pezzo avversario",
                boostText:  "Potenzia a tuo rischio e pericolo"
            },
            champion: {
                baseText:   "Scorre quanto vuole lungo le otto direzioni, ortogonali e diagonali.\nSi ferma sul primo pezzo che incontra e lo cattura se e' avversario",
		        boostTitle: "GIURAMENTO: due mosse in un turno",
		        boostText:  "Si sposta di una mossa classica di scacchi ma attenzione, se ci si muove in una casella minacciata da un pezzo \
		        			avversario la mossa boostata si interrompe\nLa seconda mossa è esattamente uguale alla prima senza le limitazioni",
                scenes: {
                    base:   "Le otto linee del Champion: ognuna continua finche' non trova un pezzo o il bordo",
                    bost: {
                        one:    "1. Una mossa normale, lungo una qualsiasi delle sue linee",
                        two:    "2. Dalla casella d'arrivo riparte con una mossa intera"
                    }
                }
            },
            minotaurus: {
                baseText:   "Scorre quanto vuole su righe e colonne, mai in diagonale.\nSi ferma sul primo pezzo che incontra e lo cattura se e' avversario",
		        boostTitle: "BERSERK: due catture in un turno",
		        boostText:  "Due mosse in un turno, ma solo se entrambe catturano un pezzo.\nDalla casella della preda riparte per catturare di nuovo.\nSe una seconda preda non c'e', il boost non parte",
                scenes: {
                    base:   "Le quattro linee ortogonali: avanti, indietro e sui due lati",
                    bost: {
                        one:    "1. La prima mossa e' una cattura",
                        two:    "2. Dalla preda riparte solo per catturare ancora: nessuna casella vuota e' un arrivo valido"
                    }
                }
            },
            jester: {
                baseText:   "Salto a \"L\": due caselle in una direzione e una in quella perpendicolare.\nE' l'unico pezzo che scavalca: chi sta in mezzo non lo ferma",
		        boostTitle: "SCHERZO: Effetto Pac-Man",
		        boostText:  "Mossa singola, ma su zone extra concesse dall'abilità che \
					        permettono al jester di sbucare dalla parte opposta della \
					        scacchiera se si \"salta\" fuori.\nIl movimento rimane sempre ad L ma \
					        per ogni casella del movimento hai la possibilità di saltare",
                scenes: {
                    base:   "Le otto L partono da qui, ma dal bordo solo quattro restano dentro la scacchiera",
                    bost: {
                        one:    "Il cavallo fa una mossa che sembra farlo andare fuori dalla scacchiera ma sbuca dal lato opposto",
                        two:    "Questa è la mossa più potente del cavallo, warp alla destra della scacchiera per sbucare a sinistra e poi warp verso il basso per sbucare in cima"
                    }
                }
            },
            valkirya: {
                baseText:   "Si muove solo in diagonale di tante caselle quanto vuoi\nMangia pezzi lungo la diagonale muovendosi",
		        boostTitle: "LANCIO: Cattura senza movimento",
		        boostText:  "Mossa singola che permette di catturare un pezzo avversario senza \
					        muovere la valkirya stessa.\n Salta un solo pezzo qualsiasi lungo il suo raggio d'azione, alleato o avversario",
                scenes: {
                    base:   "Le quattro diagonali: scorre finche' non incontra un pezzo e lo cattura se e' avversario",
                    bost:   "La Valkirya resta ferma e cattura a distanza. A sinistra scavalca l'alleato e prende il pezzo dietro di lui"
                }
            },
            bastards: {
                baseText:   "Si muove solo in avanti \nAvanza di una casella. \nDue se non si e' ancora mosso.\nMangia 1 casella in diagonale in avanti",
		        boostTitle: "INVESTITURA: Una mossa per due pezzi in un turno",
		        boostText:  "1. Un movimento classico del pedone\
					        \n2. Nello stesso turno muove anche un pezzo che era accanto alla casella di partenza, con le sue mosse classiche...",
                scenes: {
                    base:   "Avanza dritto di una casella, due se non si e' ancora mosso; in diagonale ci va solo per catturare",
                    bost: {
                        one:    "1. Il Bastardo potenziato fa la sua mossa normale, \
							    qui l'avanzata doppia",
                        two:    "2. Ora posso muovere un pezzo vicino alla casella di partenza"
                    }
                }
            }
        }
    }
}