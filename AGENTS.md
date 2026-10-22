# Repository guidance

- Keep the real SEED and Astryx component kits as the basis of their respective screens. Preserve their distinct visual behavior when changing the comparison or app views.
- Keep empty, loading, and error states clear. The experience must make sense without sound and remain accessible by keyboard and assistive technology.
- Never invent AI predictions, sign-language examples, scores, or user activity. Show an honest unavailable or sample state when a real result is not available.
- Treat planning and research items marked `논의필요 범위` as proposals that still need discussion, not confirmed production requirements.
- Do not commit credentials or private user data. Keep local secrets in ignored environment files; `.env.example` must contain placeholders only.
- Before completing code changes, run `npm test` and `npm run build` when the change affects the app. Fix failures introduced by the change and report checks that could not run.
- Keep required assets and their notices tracked, including public model, font, image, WebAssembly, and PDF files.
