
up:
	@chmod +x script/check_env.sh
	@./script/check_env.sh
	docker compose up --build

down:
	docker compose down --remove-orphans

delete:
	docker system prune -a -f
	docker volume prune -a -f

re: down delete up

.PHONY: up down delete re restart pull restore