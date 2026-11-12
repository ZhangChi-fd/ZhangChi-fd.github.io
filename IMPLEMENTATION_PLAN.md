# Milestones and review

## Repository assessment · 12 November 2026

The supplied workspace began as an empty local Git worktree on an unborn `main`, with no remote. It now uses the existing GitHub repository as `origin`. Its local review branch, `codex/xp-portfolio-plan`, starts at `origin/main` commit `8f5707f`. Inspection found two commits in that history and a clean checkout before the planning documents were added. Git advertised `main` as the default and only remote branch. [Repository at the inspected commit](https://github.com/ZhangChi-fd/ZhangChi-fd.github.io/tree/8f5707ff6534af4fca0bbc28690d18162d8676f1)

The tracked tree contains `README.md` and `index.html`. The latter displays “Hello World” and “I'm hosted with GitHub Pages.” There is no tracked workflow, package manifest, build configuration, custom-domain file, or media. The public site returned HTTP 200 with the same homepage content. The public deployment record identifies the `github-pages` environment, `main`, and the inspected commit. The unauthenticated Pages settings request returned 404. Branch publishing from the root fits the observed files, but the selected source and folder still need confirmation in Settings → Pages. [Live homepage](https://zhangchi-fd.github.io/) · [Deployment records](https://api.github.com/repos/ZhangChi-fd/ZhangChi-fd.github.io/deployments)

The local shell exposes Git 2.45 and Node 24.22.1. Neither npm nor GitHub CLI resolved on its current PATH. Locate a working npm installation or use a Node distribution that includes it for milestone 1. GitHub CLI is optional. The baseline has no type-check, lint, or build scripts.

## Sequence

Each row depends on the preceding milestone. Before starting a milestone, identify the files and acceptance checks. At its end, report checks actually run, open issues, and any departures from the design.

| Milestone | Deliverable and affected files | Verify |
| --- | --- | --- |
| 0 · Design | Repository assessment, `PROJECT_SPEC.md`, `ARCHITECTURE.md`, and this plan. | Compare the local branch with the inspected commit, check the planning documents, and submit the design for approval before starting 1. |
| 1 · Foundation | Vite/React/TypeScript entry, package files, base CSS, original desktop art and icons, registry, icon layout, taskbar, and Start navigation. | Reproduce installation from the lockfile. Type-check and build. Inspect icon labels, spacing and contrast at 1366 × 768 and a narrow viewport. |
| 2 · Window interactions | Reducer, shell, desktop and taskbar wiring. Use a simple window body to exercise the shell. | Open two windows, cycle focus, reopen a minimized instance, drag to all edges, shrink the viewport, and close the active window. Check active title, taskbar state, keyboard focus, and single-pane behavior. |
| 3 · Content | Content records, document, folder, project detail, photo and favorites viewers, six desktop entries, media and PDF when available. | Start with About open. Follow every section from both navigation surfaces. Open a detail and return. Exercise previous/next and collection boundaries with fixtures. Check unavailable assets and supplied contact URLs. |
| 4 · Extension rehearsal | Temporary local fixtures for one project, several photos, and a new folder. | Add each through content or registry only. Check both navigation surfaces, grid labels and detail views. Remove fixtures after verification and check the production registry contains only the six requested entries. |
| 5 · Usability and polish | Targeted changes to styles, shell, controls, semantics, and media sizing. | Exercise mouse, keyboard, and touch. Test at 1366 × 768, 390 × 844, and 200% zoom. Check focus visibility and return, text contrast, overflow, reduced motion, and on-demand full image requests. |
| 6 · Deployment preparation | Production build, one Pages workflow, README, and `CONTENT_GUIDE.md` based on the implemented schema. | Run a clean install, type-check, build, and serve the resulting artifact locally. Check root asset URLs, available PDF, external links, and all six entries. Review workflow and manual Pages settings with the owner. |

From milestone 1 onward, run available type, build, and configured lint checks. Use a browser for changed interactions, console errors and broken requests. Recheck the initial About view, Start navigation and window restoration when touching shared behavior. Record unperformed checks explicitly.

## Release preparation

At milestone 6, recheck the current publishing source in Settings → Pages and any workflows added since this assessment. Prepare one workflow with official supported actions pinned to reviewed commit SHAs, a matching Node version, `npm ci`, a type check, and the Vite build. Upload `dist/` as the Pages artifact. A dependent deploy job uses the `github-pages` environment with Pages write and OIDC token permissions. Keep generated output out of Git.

Propose manual workflow dispatch on the reviewed `main` revision so publication is an explicit owner action. At an approved cutover, select **GitHub Actions** under Settings → Pages → Build and deployment → Source if needed, then run the reviewed workflow. Live verification belongs after authorized deployment and includes the root URL, assets, navigation and CV availability. [GitHub Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)

The maintenance guide gives worked examples for editing the biography and contacts, adding projects and photos, replacing the CV, registering a folder, and introducing a viewer. Record artwork origins and licenses alongside the applicable asset instructions.

## Decisions for review

- **Before milestone 1:** approve the proposed static stack, custom Luna styling, and initial desktop composition. The recommended baseline keeps windows at responsive preset sizes with desktop dragging and a single foreground pane on phones.
- **For milestone 3:** identify any confirmed project records, portrait, personal photos, CV, or additional contact links to include. The foundation can proceed with the specified empty states. Candidate topics can appear as research directions until details are confirmed.
- **For milestone 6:** confirm the Pages source in the owner settings and the preferred release trigger. Manual dispatch is the proposed default.
