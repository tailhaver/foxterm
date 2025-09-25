# Foxterm

A full-stack website featuring multiple custom windows, such as [xterm.js](https://xtermjs.org/)-based terminals or markdown views, for the user to interact with.

## Quick start

### Dependencies:  

 - [uv](https://docs.astral.sh/uv/getting-started/installation/)  

### Setup:

1. Install dependencies  

```shell
uv sync
```

2. Configure environment
- Add any existing environment variables to .env, such as your secret key
- Configure UV to use your .env file by setting the `UV_ENV_FILE` variable to ".env"

3. Start the program
```shell
uv run __init__.py
```

## Available commands
 - `clear`
 - `echo` 
 - `help` 
 - `whoami`

 - `cat`
 - `cd`
 - `ls`
 - `pwd`
 - `open` – Open a file in a markdown window

 - `fox` – Display an ASCII version of the FluentUI fox emoji

 - `github` – Display a hyperlink to [my] GitHub page
 - `twitter` – Display a hyperlink to [my] Twitter page