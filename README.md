# kobo.gg

## Pre-Reqs

- Makefile support
- dotnet core 9
- docker & docker compose

## Installation

Install kepubify:
```shell
sudo curl -L https://github.com/pgaskin/kepubify/releases/download/v4.0.4/kepubify-linux-64bit -o /usr/local/bin/kepubify && \
    sudo chmod +x /usr/local/bin/kepubify
```

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