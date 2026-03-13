# Eval: Expressive Buddy Emotions

## Code Graders (bash commands that must exit 0)
- `grep -r "buddy-proud\|buddy-worried\|buddy-curious" /Users/danleemh/ai/apps/inspiror/frontend/src/index.css`
- `grep -r "buddyEmotion\|\"proud\"\|\"worried\"\|\"curious\"" /Users/danleemh/ai/apps/inspiror/frontend/src/components/EditorView.tsx`
- `grep -r "prefers-reduced-motion" /Users/danleemh/ai/apps/inspiror/frontend/src/index.css | grep -c "buddy-proud\|buddy-worried\|buddy-curious" || grep -c "buddy-proud\|buddy-worried\|buddy-curious" /Users/danleemh/ai/apps/inspiror/frontend/src/index.css`
- `cd /Users/danleemh/ai/apps/inspiror/frontend && npx tsc --noEmit 2>&1 | grep -c "error TS" | grep "^0$"`

## Regression Evals (full test suite)
- `cd /Users/danleemh/ai/apps/inspiror/frontend && npx vitest run --reporter=verbose 2>&1 | tail -5`
- `cd /Users/danleemh/ai/apps/inspiror/backend && npx jest --passWithNoTests 2>&1 | tail -3`

## Acceptance Checks (verification commands)
- `grep -c "buddy-proud" /Users/danleemh/ai/apps/inspiror/frontend/src/index.css | grep -v "^0$"`
- `grep -c "buddy-worried" /Users/danleemh/ai/apps/inspiror/frontend/src/index.css | grep -v "^0$"`
- `grep -c "buddy-curious" /Users/danleemh/ai/apps/inspiror/frontend/src/index.css | grep -v "^0$"`
- `grep -rn "emotion" /Users/danleemh/ai/apps/inspiror/frontend/src/components/ChatHeader.tsx | grep -c "prop\|Emotion\|emotion" | grep -v "^0$"`
- `cd /Users/danleemh/ai/apps/inspiror/frontend && npx vitest run --coverage 2>&1 | grep "All files" | grep -E "[89][0-9]\.[0-9]+|100"`

## Thresholds
- All checks: pass@1 = 1.0
