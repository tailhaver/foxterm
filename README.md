# Foxterm

A full-stack website featuring custom [xterm.js](https://xtermjs.org/)-based terminals for the user to interact with.

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

 - `fox` – Display an ASCII version of the FluentUI fox emoji

 - `github` – Display a hyperlink to [my] GitHub page
 - `twitter` – Display a hyperlink to [my] Twitter page
 - `open` – Open one of my social pages in a new tab\
 Available arguments: `github`, `git`, `gh`, `twitter`, `twt`, `x`.