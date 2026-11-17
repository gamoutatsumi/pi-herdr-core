# pi-herdr-core

A [Pi](https://pi.dev) package for using herdr-core (CLI: `hc`) efficiently.
It is for `hc` only — not for `herdr`, the older terminal multiplexer.

## What it provides

1. **Skill `herdr-core`**
   A cheat sheet of the core `hc` workflows (delegating tasks, waiting,
   running slow commands, collecting results, cleanup, error codes).
   It replaces loading the full ~300-line `hc --skill` output every time.
2. **Tool `hc_manual`**
   Returns the live output of the local CLI verbatim (`hc --skill`;
   `herdr-app --skill` with `target: "herdr-app"`).
   Use it for details the cheat sheet omits (remote machines, recovery,
   macOS, config keys, window and layouts).
   Since it re-runs the CLI on every call, it never serves a stale copy
   when your `hc` version changes.
3. **Footer status**
   When pi runs inside herdr-core (i.e. `$HC_TERMINAL_ID` is set), your
   terminal ID (e.g. `herdr t5p`) is always shown in the footer.

## Install

```sh
pi install git:github.com/gamoutatsumi/pi-herdr-core
```

Until the repository is pushed, you can try it from a local path.

```sh
pi install /path/to/pi-herdr-core
```

**Note:** if you already have a standalone `herdr-core` skill (e.g.
`~/.pi/agent/skills/herdr-core/`), remove it after installing.
When skills share a name, the first one discovered wins.

## Usage

No configuration required. The agent loads the skill automatically for
tasks where `hc` fits — sub-agents, background tasks, long-running
commands, remote machines. To force it, use `/skill:herdr-core`.

To have the agent fetch the current manual, just ask — for example,
"check the latest `hc` manual with `hc_manual` and tell me how to use
remote machines."

## Development

- Enter the dev environment with `nix develop` (`pi`, `nodejs` 24,
  `typescript` are available).
- The TypeScript extension is loaded directly via jiti, so there is no
  build step.
- Smoke test (Node 24+. Drives the extension with a fake `ExtensionAPI`
  and checks tool registration, manual fetching, error paths, and footer
  behavior):

  ```sh
  npm install --no-save typebox
  node scripts/smoke.mjs
  ```

- Try the extension alone: `pi -e ./extensions/herdr-core.ts`
- Try the skill alone: with the skills directory discoverable by pi
  (e.g. `~/.agents/skills/`), run `/skill:herdr-core`.
