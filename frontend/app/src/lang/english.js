export const english = {
    messages: {
        common: {
            name: "ChessZ",
            search: "Search",
            players: "Players",
            tournament: "Tournament | Tournaments",
            accept: "Accept",
            reject: "Reject",
            pending: "Pending...",
            friend: "Friend | Friends",
            win: "Win | Wins",
            lose: "Defeat | Defeats",
            draw: "Draw | Draws",
            game: "Game | Games",
            by: "by",
            or: "or"
        },
        header: {
            inv: {
                creation: "Created {date} @:common.by",
                desc: "You've been invited to the {tourName} @.lower:common.tournament created @:common.by {tourCreator}.<br>Would you like to participate?",
                expired: "Invitation no longer valid",
                friendTitle: "@:common.friend request",
                tourTitle: "@:common.tournament invitation",
                tagTitle:   "Your rank has changed!",
                friendNotif : "{sender} sent you a @.lower:common.friend request",
                tourNotif: "{sender} has invited you to participate in the {tour} @.lower:common.tournament",
                tagNotif:   "Your rank has changed into {rank}!"
            },
            notifications: "Notifications",
            zeroNotif: "No notifications",
            readAll: "Read all",
            profile: "Profile",
            settings: "Settings",
            logout: "Logout",
            login: "Login"
        },
        menu: {
            userList: "{nUser} users found for \"",
            online: "Play online",
            bot: "Play vs Bot",
            lBoard: "Leader Board",
            codex: "Codex"
        },
        login: {
            val: {
                name: "Name",
                surname: "Surname",
                nationality: "Nationality",
                theme: "Theme"
            },
            OTP: {
                auth: "OTP Authentication",
                desc: "Enter the code sent to you by email.",
                exp: "It'll expire in {date}",
                on: "On",
                off: "Off"
            },
            err: {
                title: "Wrong credentials",
                wrong: "Incorrect username or password.",
                logged: "User already logged in.",
                tooMany: 'Too many attempts made.',
                clone: "A user with these\ncredentials already exists",
				username: "The username must be\nat least 4 characters long",
				email: "Please make sure you\nhave entered a valid email",
				password: "The password must contain:\n\
                            - at least 8 characters\n- a number\n\
                            - an uppercase letter\n- a lowercase letter\n\
                            - a special character ($, %, #...)"
            },
            welcome: "Welcome!",
            wellback: "Welcome back!",
            signIn: "Sign in",
            forgot: "Forgot password?",
            loginAcc: "@:header.login with your account",
            missingAcc: "Don't have an account yet?",
            presentAcc: "You already have an account?",
            google: "Continue with Google"
        },
        leaderBoard: {
            title: "Top 10 @.lower:common.players",
            outOf: "out of {games}",
            empty: "No players on the leaderboard yet",
        },
        tournaments: {
            newTour: "Create a new @.lower:{'common.tournament'}!",
            placeholder: "@:common.tournament name",
            creator: "Creator of the @.lower:{'common.tournament'}:",
            button: "Create",
            ongoing: "Ongoing...",
            closed: "Closed",
            noTour: "No @.lower:common.tournament"
        },
        userPage: {
            edit: {
                infoU: "User's info",
                changeAvatar: "Change avatar",
                removeAvatar: "Remove avatar",
                changePwd: "Change password",
                newPwd: "New password",
                saveChanges: "Save",
                desc: "The password must contain at least 8 characters, a number, an uppercase and a lowercase letter and a special character ($,%,#...)",
                googlePwd_one: "You created your accont throught Google and right now you don't have a password.",
                googlePwd_two: "Create one for your security!"
            },
            friendList: "Friends list",
            removeFriend: "Remove @.lower:common.friend",
            friendRequest: "@:common.friend requests",
            pendingRequest: "No pending requests",
            matchHistory: "Match history",
            sendRequest: "Send @.lower:common.friend request"
        },
        game: {
            playPage: {
                title: "Choose your fate",
				aiTitle: "Challenge the Machine",
                reload: "Reloading game",
                opt: {
                    priv: "Private",
                    friend: "Friendly",
                    rank: "Ranked",
                    looking: "Looking for opponent"
                },
				ai: {
                    side: {
                        white: "White",
                        black: "Black",
                        random: "Random",
                        looking: "Waking the machine"
                    }
                },
                play: "Play!",
                cancel: "Cancel"
                
            },
            ChessBoard: {
                moveHistory:    "No moves yet",
                chatHistory:    "No messages yet",
                chatPrompt:     "Type here your message...",
                send:           "Send",
                buttons: {
                    useAbility: "Use ability!",
                    abilityOn:  "Ability ON!",
                    endTurn:    "End turn!",
                    boostPiece: "Boost piece!",
                    giveUp:     "Give Up",
                    askDraw:    "Ask for a draw",
                    waiting:     "Waiting..."
                }
            }
        },
        allert: {
            title:      "We're sorry... :(",
            desc_one:   "Because of the 3000 infos and features that are needed to play",
            desc_two:   "matches can only be played on PC.",
            desc_three:  "If you're on PC but still see this warning, try de-zooming the page"
        },
        legal: {
            privacy: {
                title: "Privacy policy",
                desc:   "This Privacy Policy document describes how @:{'common.name'}, student project 42 Firenze, collects, manages, uses, and protects the personal data of users who register and use the application.",
                list:   ["The data collected during registration and for using the service are email, first name, last name, username, national identity, avatar;",
                        "The previously listed data is used for authentication, friendship management, tournament/game creation and management, two-factor authentication (2FA);",
                        "To send verification code regarding double authentication, external providers with SMTP (Google) service will be used to share the email;",
                        "For registration via OAuth, First Name, Last Name and email will be shared with external services (Google);",
                        "The user can access, modify and delete their data at any time. Deleting the account instantly and permanently deletes all user data;",
                        "To protect all the user's personal information, the following security measures are taken: password hashing with salt, two-factor authentication (optional), HTTPS;",
                        "All user data is not sold, or profiled, for commercial purposes in any way."]
            },
            service: {
                title:  "Terms of Service",
                date:   {   title: "Last updated:",
                            desc: "10/08/2026" },
                intro:  {   title: "Introduction",
                            desc_one: "@:common.name is a web application developed as a student project as part of the 42 Firenze program, which allows users to play chess in online, tournament, and local AI matches, manage a profile, and interact with other users. By using the service, you are fully accepting those present \“",
                            desc_two: "\”. If you do not accept these terms, please do not use the application." },
                list:   {
                    "Access Requirements" : "To use @:common.name you need to create an account by providing a valid email and username. For the topics covered and the terms used, the service can be used for users no younger than 14 years old; minor users should use the service with the consent of a parent or guardian.",
                    "User behavior" : "By using @:{'common.name'}, the user commits to:",
                    "Account" : "The user is responsible for the confidentiality of their login credentials and all activities performed through their account. @:common.name reserves the right to suspend or delete accounts that violate these rules, that present suspicious or fraudulent activity, or at the user's request",
                    "User-generated content" : "Avatars and other content uploaded by the user remain the property of the user, who claims to own the rights to upload them. @:common.name reserves the right to remove content deemed inappropriate, offensive, or in violation of third-party rights, without notice.",
                    "Liability limitation" : "@:common.name is a project created exclusively for educational purposes, within the 42Firenze curriculum, without commercial purposes. The service is foirnito “as is”, with no guarantees of continuous availability, absence of errors or liovelli of service (SLA). Developers are not responsible for any data loss, service outages, or damage resulting from using the application.",
                    "Term Changes" : "@:common.name reserves the right to change this Terms of Service page at any time. Any substantial changes will be communicated to users by notice on the application or by email. Continued use of the service after a change constitutes acceptance of the new terms.",
                    "Applicable law" : "These terms are governed by Italian law, as a project carried out within the framework of campus 42 Firenze."
                },
                behavior:   ["Do not use cheats, bots, automation scripts, or other forms of altering the normal flow of the game;",
                            "Do not engage in offensive, discriminatory, or abusive behavior toward other users (in chat, usernames, or avatars);",
                            "Do not attempt to access other users' accounts or compromise the security of the platform"],
                ban:    "Failure to follow these rules may result in account suspension or deletion.",
            },
        },
        codex: {
            title: "Their powers",
            move: "Movements",
            ability: "Special ability",
            king: {
                name:   "The King",
                quote:  "\"'Black or White' they ask. I've got better things to do.\"",
                lore:   "Sons of the old Red King, the twins Black and White has lived a comfortable life, without the worries of ordinary peons.\
	                    After the death of the Red King caused by a bee's sting, there were little to no instructions for the heir to the throne, and\
	                    the twins started to childishly bicker like two spoiled kids.\
	                    The White prince, who made a fool of himself up till that moment, decided to declare war over his own brother.\
                        What kind of king will the kingdom have is not something that everyone can predict or know, \
                        but the only sure thing is that they'll do whaterever they can to not lose this war.",
                move:   "The King can move up to 1 square in any direction, until he's not under his foes' fire.",
                ability: {
                    name:   "Last to fall",
                    desc:   "\"What kind of king will thou be?\" is a question you'll have to answer, \
                            and this will give you an incredible strength as soon as you'll reamin the last to stand.",
                    cost:   "0"
                }
            },
            champ: {
                name:   "The Champion",
                quote:  "\"Strong, sturdy and with a prominent role. If they were nice too, they would steal your wife.\"",
                lore:   "The Champions are not only the King's personal knights, but also a true emblem of strength.\
                        They're tall, fast, deadly and men of few words. Every true knight dreams to earn one day this title and they \
	                    usually joust and fight in tournaments and warfares to prove themselves worthy.\
                        But the truth is that none of them will ever become a Champion.\
                        The origins of these men dwell in a dark shadow of history: the candidates are not simple men and knights, but \
	                    descendants of families which genealogy has been controlled for ages. They're force to undergo \
	                    extremely tough trainings, which look like more tortures, and magic rituals to develop all of their potential.\
	                    After proving their worth, the last step to become a Champion is to cut their tounge in front of the King \
	                    so that they may never reaveal Their Majesty's secrets.",
                move:   "The Champion can move in any direction, diagonally or in a cross, and at any distant they want.",
                ability: {
                    name:   "Vow",
                    desc:   "After their turn, the Champion can move a second time as long as they don't end up in an endanged square.",
                    cost:   "10"
                }
            },
            mino: {
                name:   "The Minotaur",
                quote:  "\"Damn monsters made up by some other damn monsters.\"",
                lore:   "Minotaurs are monstrosities created under the direct orders of the Red King.\
                        They are the outcome of various experiment which joined genetic manipulation thruogh embreeding - used for centuries \
                        on dogs, horses, plants and, in some particular cases, on men too - and the blood's alchemy of the distant east lands.\
	                    These experiment birthed beasts with a human body, hooves and a bull's head.\
	                    Originally they were meant to ..., but their incredible strength made them a perfect entertainment for the royal families.\
	                    Their overaggressive trait has its roots in the firsts successful hybrids which suffered from a serious schizophrenia,\
	                    caused by their hyper-paraidolia, which also constantly caused them migraines. \
	                    Therefore they use their head to charge anyone or anything in front of them.",
                move:   "The Minotaur can move in a cross by charging their enemy.",
                ability: {
                    name:   "Berserk",
                    desc:   "After taking down an enemy's piece, the Minotaur can attack for a second time another foe.",
                    cost:   "5"
                }
            },
            jester: {
                name:   "The Jester",
                quote:  "\"What do the jesters do when no one is looking? They listen.\"",
                lore:   "If you plan to organaize a banquet, the Jesters have to be there too.\
                        You'll see them wriggle away avoiding stones thronw by fat little childen of lords or sirs.\
	                    Their flossy and too-thight garment can make anyone in a good mood, even the Blue King. \
	                    He still had a broad grin when the Jesters delivered his head to the Red King.\
	                    Outside of the palaces no one wuold ever even look at them.\
	                    Many mothers of the kingdom swear to have seen one of them took their newborn after their birth.\
	                    Across the sea their called \"The Red King's eyes\".",
                move:   "The Jester can move in a L shape, 2 squares in one direction and 1square in the direction perpendicular to the first.",
                ability: {
                    name:   "Dirty Trick",
                    desc:   "The Jester can use space as they pleases, exiting the chessboard and returning to the opposite side.",
                    cost:   "5"
                }
            },
            valk: {
                name:   "The Valkyrie",
                quote:  "\"Valkyries, women who fall apart... Literally.\"",
                lore:   "Valkyries originated as a gruop of women who survived the Great War which destroyed the west lands, turning once blooming fields into graveyards.\
                        Valkyries organized themself in a matriarchal society which roam from a battlefield to another helping the survivors.\
	                    Quarrels and disputes with mercenaries happened often, this brouth them to develop a new branch of medicine, with the help of black magic.\
	                    This new practice allowed them to use the dead to heal their wounds, but it made them lose their wits and their original goal.\
	                    Born as survivors, now they've become a morbid pile of dead meat in search of new bodies to use in their rituals.",
                move:   "The Valkyrie can move diagonally.",
                ability: {
                    name:   "Hurl",
                    desc:   "The Valkyrie can throw their javelin striking the enemy without moving. They can also skip a piece if it's in the way!",
                    cost:   "3"
                }
            },
            bastard: {
                name:   "The Bastards",
                quote:  "\"Don't have pity on them. They're only some bastards afterall.\"",
                lore:   "The bastard children of the royals, born from a lover or licentious daughter of some minor lord, \
                        by her own decision or just to to do his father a favour. With the start of the war they were forced to take side \
                        and forearm for their own \"father\", even if for many it's difficult to say which of the two he is. But for these Bastards the only \
                        important thing is the prospect of a bright future where they're rewarded for their bravery, a future where they're not captured, torn to pieces or both.\
                        In any case no one will miss them.",
                move:   "The Bastards can move 1 square forward - or 2 if it's their first time moving - and can attack an enemy piece if it's in front of them diagonally.\
                        When they reach the oder side of the chessboard they can become any other piece.",
                ability: {
                    name:   "Investiture",
                    desc:   "The Bastards who are assigned the tittle of (minor) lord can command the other pieces near them to move as they please, but only after their turn.",
                    cost:   "1"
                }
            }
        },
        tutorialCodex: {
            baseTitle:  "BASIC CHESS MOVEMENT",
            king: {
                baseText:   "Si muove di una sola casella per volta, in tutte e otto le direzioni.\nCattura allo stesso modo, spostandosi sulla casella del pezzo avversario",
                boostText:  "Potenzia a tuo rischio e pericolo"
            },
            champion: {
                baseText:   "Scorre quanto vuole lungo le otto direzioni, ortogonali e diagonali.\nSi ferma sul primo pezzo che incontra e lo cattura se e' avversario",
		        boostTitle: "VOW: two movements in one turn",
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
		        boostTitle: "DIRTY TRICK: Pac-Man effect",
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
		        boostTitle: "HURL: Cattura senza movimento",
		        boostText:  "Mossa singola che permette di catturare un pezzo avversario senza \
					        muovere la valkirya stessa.\n Salta un solo pezzo qualsiasi lungo il suo raggio d'azione, alleato o avversario",
                scenes: {
                    base:   "Le quattro diagonali: scorre finche' non incontra un pezzo e lo cattura se e' avversario",
                    bost:   "La Valkirya resta ferma e cattura a distanza. A sinistra scavalca l'alleato e prende il pezzo dietro di lui"
                }
            },
            bastards: {
                baseText:   "Si muove solo in avanti \nAvanza di una casella. \nDue se non si e' ancora mosso.\nMangia 1 casella in diagonale in avanti",
		        boostTitle: "INVESTITURE: One movement for two pieces in one turn",
		        boostText:  "1. One classic pawn movement\
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