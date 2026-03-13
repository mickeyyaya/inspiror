# Eval: First-Run Onboarding Tooltips

## Code Graders (bash commands that must exit 0)
- `test -f /Users/danleemh/ai/apps/inspiror/frontend/src/hooks/useOnboarding.ts`
- `test -f /Users/danleemh/ai/apps/inspiror/frontend/src/hooks/useOnboarding.test.ts`
- `grep -c "inspiror-onboarding" /Users/danleemh/ai/apps/inspiror/frontend/src/hooks/useOnboarding.ts | grep -v "^0$"`
- `grep -c "advanceStep\|skipAll\|currentStep" /Users/danleemh/ai/apps/inspiror/frontend/src/hooks/useOnboarding.ts | grep -v "^0$"`
- `grep -rn "useOnboarding" /Users/danleemh/ai/apps/inspiror/frontend/src/components/EditorView.tsx`
- `cd /Users/danleemh/ai/apps/inspiror/frontend && npx tsc --noEmit 2>&1 | grep -c "error TS" | grep "^0$"`

## Regression Evals (full test suite)
- `cd /Users/danleemh/ai/apps/inspiror/frontend && npx vitest run --reporter=verbose 2>&1 | tail -5`
- `cd /Users/danleemh/ai/apps/inspiror/backend && npx jest --passWithNoTests 2>&1 | tail -3`

## Acceptance Checks (verification commands)
- `grep -c "onboarding" /Users/danleemh/ai/apps/inspiror/frontend/src/i18n/translations.ts | grep -v "^0$"`
- `grep -c "advanceStep\|skipAll" /Users/danleemh/ai/apps/inspiror/frontend/src/hooks/useOnboarding.test.ts | grep -v "^0$"`
- `cd /Users/danleemh/ai/apps/inspiror/frontend && npx vitest run --coverage 2>&1 | grep "All files" | grep -E "[89][0-9]\.[0-9]+|100"`

## Thresholds
- All checks: pass@1 = 1.0
