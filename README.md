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

## why?
well.. why not?
i originally got the idea for my website redesign from a [video by shar](https://www.youtube.com/watch?v=_tWh4cYCTv0) on youtube. ive always wanted to make a website with window views like this. my old website was just a boring static page and i was about to go on a trip abroad! what a perfect opportunity to work!

anyways. i didn't work at all on my trip. i instead had a [great time with my girlfriend](https://www.instagram.com/p/DNp4MfZtyuM/), but still let the idea cook in my head. with hackclub's summer of making being extended, i _finally_ had a good opportunity to realize my ideas.

## how?
a lot of energy drinks and concerta. and a lot of experimenting! 
javascript was my least used language by far at this point, even being beaten out by java. it was a fight to get things to work :( but i got to basically relearn javascript!  
the terminals themselves are powered by [xterm.js](https://xtermjs.org/), but almost everything else was written from scratch. the backend is a weird mix of old [quart](https://github.com/pallets/quart) code from my original website, as well as some... _interesting_ endpoints for running commands.  
it is the largest project ive taken on in quite some time (evident by the 20 hours in one week. i have a job nyall.), which let me just try a lot of things and see what sticks.