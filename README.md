# Zero + Hono +Solid + TypeScript + Vite

## This example app is extended by adding a counter component and 10 charts using the uPlot library. 

```zsh
git clone https://github.com/rocicorp/hello-zero-solid.git
```


```zsh
cd hello-zero-solid
bun install
bun run dev:db-up
```

```zsh
# in a second terminal
bun run dev:zero-cache
```

```zsh
# in yet another terminal
bun run dev:ui
```

## Troubleshooting 
When getting error messages about zero-dash SQLite, rerun the rebuild command. It's important to run it with **npm** and not and not **bun**, as **bun** seems to break things for this specific library. 
```zsh
npm rebuild @rocicorp/zero-sqlite3
```
