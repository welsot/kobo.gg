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

frontend:
	${FRONTEND} && npm run dev

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

cs:
	${FRONTEND} && npm run format

ts:
	${FRONTEND} && npm run typecheck

