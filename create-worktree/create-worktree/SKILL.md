---
name: create-worktree
description: Use this skill when the user asks to implement a new feature, fix a bug, or make changes. This skill instructs you to create an isolated worktree using the Worktrunk (`wt`) CLI tool before starting work.
---
# Create Worktree

This skill provides instructions on how to handle user requests for new features or changes by utilizing **Worktrunk** (`wt`), a branch-centric git worktree manager.

## Workflow

1. **Understand the Target Feature/Change**: Determine what feature or fix the user wants based on their request.
2. **Determine Branch Name**: Create a descriptive branch name for the requested feature/change (e.g., `feat-add-login`, `fix-navbar-styling`).
3. **Execute Worktrunk Command**: Use `wt` to create and switch to the new worktree branch. Worktrunk automatically manages the path and setup.
   ```bash
   wt switch -c <branch-name>
   ```
4. **Locate Worktree Path (if needed)**: Because `wt` abstracts away the path, if you need to pass `dir_path` to subsequent `run_shell_command` executions or read/write files in the new worktree, you can find the directory path by running:
   ```bash
   git worktree list
   ```
5. **Implement the Feature/Change**: Proceed to fulfill the user's request within the new worktree environment.
6. **Completion**: When the task is complete, you can use `wt` commands like `wt merge main` to finalize the work or `wt remove` to clean it up.

## Example

If the user asks: "Add voice support for the game conversation":

- **Branch Name**: `feat-voice-support`
- **Commands**:
  ```bash
  wt switch -c feat-voice-support
  ```

Always notify the user that you are creating a new worktree for the requested changes using Worktrunk.
