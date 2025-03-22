# kobo.gg

## About

A simple tool for you to send .epub books to your Kobo/Kindle E-Reader.

Ensure that your e-reader supports opening web links, as you will need it to download your books from kobo.gg

Usage:

1. Go to https://kobo.gg
2. Upload your .epub, .pdf file(s)
3. You will receive a short code and the kobo.gg/{shortCode} url
4. On your e-reader (Kobo/Kindle) open kobo.gg in the web browser
5. Input the short code and press "Open"
6. Download your books

## Dev Pre-Reqs

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