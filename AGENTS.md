# AGENTS.md

## Git workflow (mandatory)

After completing ANY work change, commit and push immediately:

- **New feature / major or minor update** → commit message describes what was added (e.g. `feat: add antas4 word-badge drag and drop`)
- **Bug fix** → commit message describes what was fixed (e.g. `fix: background image not rendering on antas1-level2`)
- Small cleanups/docs → `chore:` / `docs:` prefix, same rule: say what changed.

Commands:

```powershell
git add -A
git commit -m "<type>: <what was added or fixed>"
git push origin master
```

Do not wait for the user to ask. If a commit or push fails, fix the issue and retry.

## Position (mandatory)

when adjusting the components all components must use absolute position and not relative so that when adjusting one component it wont disturb other components while adjusting the size and position of that certain component