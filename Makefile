# Examples:
# make migration name=AddUsersTable
# make rollback target=Init

BACKEND := cd backend
BACKEND_API := cd backend/api
BACKEND_TESTS := cd backend/api.Tests
FRONTEND := cd frontend

up:
	${BACKEND} && docker compose up -d --remove-orphans

stop:
	${BACKEND} && docker compose stop

api:
	${BACKEND_API} && dotnet watch run --environment Development

migration:
	${BACKEND_API} && dotnet ef migrations add $(name)

migrate:
	${BACKEND_API} && dotnet ef database update

rollback:
	${BACKEND_API} && dotnet ef database update $(target)

reset-db:
	${BACKEND_API} && dotnet ef database drop -f && dotnet ef database update

test:
	${BACKEND} && dotnet test api.Tests

restore:
	${BACKEND_API} && dotnet restore
	${BACKEND_TESTS} && dotnet restore

schema:
	${FRONTEND} && npx openapi-codegen gen api

ui:
	${FRONTEND} && npm run dev

cs:
	${FRONTEND} && npm run format

ts:
	${FRONTEND} && npm run typecheck

deploy-frontend:
	docker compose build frontend
	docker save kobogg/frontend > /tmp/kobogg/frontend.tar
	rsync -avzh --progress --info=progress2 /tmp/kobogg/frontend.tar puzzlik@puzzlik-app:/home/puzzlik/kobo.gg/docker
	ssh puzzlik-app "docker load < /home/puzzlik/kobo.gg/docker/frontend.tar"
	ssh puzzlik-app "cd /home/puzzlik/kobo.gg/repo && docker compose up frontend -d --force-recreate"

deploy-backend:
	docker compose build backend
	docker save kobogg/backend > /tmp/kobogg/backend.tar
	rsync -avzh --progress --info=progress2 /tmp/kobogg/backend.tar puzzlik@puzzlik-app:/home/puzzlik/kobo.gg/docker
	ssh puzzlik-app "docker load < /home/puzzlik/kobo.gg/docker/backend.tar"
	ssh puzzlik-app "cd /home/puzzlik/kobo.gg/repo && docker compose up backend -d --force-recreate"

