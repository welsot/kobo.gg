# kobo.gg

## Pre-Reqs

- Makefile support
- dotnet core 9
- docker & docker compose

## Installation

Install dotnet deps:
```shell
make restore
```

Install frontend deps:
```shell
cd frontend && npm install && cd ..
```

Launch db and other services via docker:
```shell
make up
```

Run migrations:
```shell
make migrate
```

## Run

Launch db and other services via docker:
```shell
make up
```

Launch frontend dev server on `localhost:3000`:
```shell
make ui
```

Launch backend on `localhost:8080` with hot-reload:
```shell
make api
```