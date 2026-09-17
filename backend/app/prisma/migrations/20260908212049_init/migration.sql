-- CreateEnum
CREATE TYPE "friendships_status" AS ENUM ('accepted', 'pending');

-- CreateEnum
CREATE TYPE "matches_outcome" AS ENUM ('Win', 'Lose', 'Draw');

-- CreateEnum
CREATE TYPE "matches_round" AS ENUM ('F', 'SF', 'QF');

-- CreateEnum
CREATE TYPE "notification_status" AS ENUM ('read', 'not read', 'pending');

-- CreateEnum
CREATE TYPE "tournaments_status" AS ENUM ('open', 'ongoing', 'closed');

-- CreateTable
CREATE TABLE "abilities" (
    "id_ability" SERIAL NOT NULL,
    "name" VARCHAR(250) NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "abilities_pkey" PRIMARY KEY ("id_ability")
);

-- CreateTable
CREATE TABLE "friendships" (
    "id_friendship" SERIAL NOT NULL,
    "id_user1" INTEGER NOT NULL,
    "id_user2" INTEGER NOT NULL,
    "friend_status" "friendships_status" NOT NULL,
    "sender" INTEGER NOT NULL,

    CONSTRAINT "friendships_pkey" PRIMARY KEY ("id_friendship")
);

-- CreateTable
CREATE TABLE "matches" (
    "id_match" SERIAL NOT NULL,
    "start_date" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMPTZ(6),
    "round" "matches_round",
    "id_tournament" INTEGER,
    "history" JSON,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id_match")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id_notification" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "status" "notification_status" NOT NULL DEFAULT 'not read',
    "id_user" INTEGER NOT NULL,
    "creation_date" TIMESTAMPTZ(6),
    "id_sender" INTEGER,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id_notification")
);

-- CreateTable
CREATE TABLE "pieces" (
    "id_piece" SERIAL NOT NULL,
    "name" VARCHAR(250) NOT NULL,
    "cost" INTEGER NOT NULL DEFAULT 4,
    "id_ability" INTEGER NOT NULL,
    "info" TEXT,
    "lore" TEXT,
    "quote" TEXT,

    CONSTRAINT "pieces_pkey" PRIMARY KEY ("id_piece")
);

-- CreateTable
CREATE TABLE "tournament_players" (
    "id_tournament" INTEGER NOT NULL,
    "id_user" INTEGER NOT NULL,

    CONSTRAINT "tournament_players_pkey" PRIMARY KEY ("id_tournament","id_user")
);

-- CreateTable
CREATE TABLE "tournaments" (
    "id_tournament" SERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "status" "tournaments_status" DEFAULT 'open',
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournaments_pkey" PRIMARY KEY ("id_tournament")
);

-- CreateTable
CREATE TABLE "users" (
    "id_user" SERIAL NOT NULL,
    "name" VARCHAR(250) NOT NULL,
    "surname" VARCHAR(250) NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(200),
    "email" VARCHAR(100) NOT NULL,
    "nationality" VARCHAR(50) NOT NULL,
    "image" TEXT,
    "points" INTEGER NOT NULL DEFAULT 500,
    "title" VARCHAR(200) NOT NULL DEFAULT 'Paesant',
    "id_preference" INTEGER NOT NULL DEFAULT 1,
    "mfa" BOOLEAN NOT NULL DEFAULT false,
    "google_id" VARCHAR,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "users_matches" (
    "id_usermatch" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_match" INTEGER NOT NULL,
    "outcome" "matches_outcome",
    "team" JSON NOT NULL DEFAULT '[
  {"type": "Sovrano", "count": 1, "cost": 0},
  {"type": "Campione", "count": 1, "cost": 10},
  {"type": "Valchiria", "count": 2, "cost": 3},
  {"type": "Minotauro", "count": 2, "cost": 5},
  {"type": "Giullare", "count": 2, "cost": 5},
  {"type": "Bastardo", "count": 8, "cost": 1}
]',

    CONSTRAINT "users_matches_pkey" PRIMARY KEY ("id_usermatch")
);

-- CreateTable
CREATE TABLE "preferences" (
    "id_preference" SERIAL NOT NULL,
    "name" VARCHAR(250) NOT NULL,

    CONSTRAINT "preferences_pkey" PRIMARY KEY ("id_preference")
);

-- CreateIndex
CREATE UNIQUE INDEX "unique_user_pair" ON "friendships"("id_user1", "id_user2");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "unique_email" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_unique" ON "users"("google_id");

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "fk_id_friend1" FOREIGN KEY ("id_user1") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "fk_id_friend2" FOREIGN KEY ("id_user2") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_sender_fkey" FOREIGN KEY ("sender") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "fk_id_tournament" FOREIGN KEY ("id_tournament") REFERENCES "tournaments"("id_tournament") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "fk_id_notifications" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "fk_id_sender" FOREIGN KEY ("id_sender") REFERENCES "users"("id_user") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pieces" ADD CONSTRAINT "fk_id_ability" FOREIGN KEY ("id_ability") REFERENCES "abilities"("id_ability") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_players" ADD CONSTRAINT "fk_tp_tournament" FOREIGN KEY ("id_tournament") REFERENCES "tournaments"("id_tournament") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tournament_players" ADD CONSTRAINT "fk_tp_user" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tournaments" ADD CONSTRAINT "fk_tournaments_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id_user") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "fk_preference" FOREIGN KEY ("id_preference") REFERENCES "preferences"("id_preference") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_matches" ADD CONSTRAINT "fk_id_match" FOREIGN KEY ("id_match") REFERENCES "matches"("id_match") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_matches" ADD CONSTRAINT "fk_id_user" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE NO ACTION ON UPDATE CASCADE;
