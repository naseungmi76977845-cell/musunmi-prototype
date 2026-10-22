type SignupPurposeKind = 'learn' | 'find' | 'share' | 'connect';

/** Small, non-instructional illustrations for the sign-language signup goals. */
export function SignupPurposeArt({kind}: {kind: SignupPurposeKind}) {
  return <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false">
    {kind === 'learn' && <>
      <path d="M9 31c0-11 9-20 21-20 13 0 24 9 24 21s-10 21-23 21C18 53 9 44 9 31Z" fill="var(--accent)" />
      <path d="M13 21.5c0-2.5 2-4.5 4.5-4.5h9c3.8 0 6.5 1.6 6.5 4.4v25.1c-1.8-2.3-4.2-3.5-7.4-3.5h-8.1a4.5 4.5 0 0 0-4.5 4.5V21.5Z" fill="white" stroke="var(--brand)" strokeWidth={2.2} strokeLinejoin="round" />
      <path d="M33 21.4c0-2.8 2.8-4.4 6.6-4.4h8.9c2.5 0 4.5 2 4.5 4.5v25.9a4.5 4.5 0 0 0-4.5-4.4h-8.1c-3.2 0-5.7 1.2-7.4 3.5V21.4Z" fill="var(--soft)" stroke="var(--brand)" strokeWidth={2.2} strokeLinejoin="round" />
      <path d="M18 24h8m-8 5h8m15-5h6m-6 5h6" stroke="var(--brand)" strokeWidth={1.8} strokeLinecap="round" opacity={0.46} />
      <path d="m49 7 1.5 3.8 3.7 1.4-3.7 1.5L49 17.5l-1.4-3.8-3.8-1.5 3.8-1.4L49 7Z" fill="white" stroke="var(--brand)" strokeWidth={2.2} strokeLinejoin="round" />
      <circle cx="56.5" cy="22.5" r="2" fill="var(--soft)" stroke="var(--brand)" strokeWidth={1.8} />
    </>}

    {kind === 'find' && <>
      <path d="M7 30c0-12 9.5-21 22-21s23 9 23 21-10 22-23 22S7 42 7 30Z" fill="var(--soft)" />
      <rect x="11" y="12" width="31" height="29" rx="7" fill="white" stroke="var(--brand)" strokeWidth={2.2} />
      <path d="M18 22c2.7-3.2 6-3.2 8.7 0s6 3.2 8.7 0M18 29c2.7 3.2 6 3.2 8.7 0s6-3.2 8.7 0" stroke="var(--accent)" strokeWidth={2.2} strokeLinecap="round" />
      <circle cx="20" cy="35" r="1.5" fill="var(--brand)" />
      <circle cx="26" cy="35" r="1.5" fill="var(--brand)" />
      <circle cx="32" cy="35" r="1.5" fill="var(--brand)" />
      <circle cx="38" cy="38" r="11" fill="var(--accent)" stroke="var(--brand)" strokeWidth={2.2} />
      <circle cx="38" cy="38" r="4" fill="white" stroke="var(--brand)" strokeWidth={1.8} />
      <path d="m46 46 8 8" stroke="var(--brand)" strokeWidth={4.8} strokeLinecap="round" />
      <path d="m46 46 8 8" stroke="var(--accent)" strokeWidth={2.2} strokeLinecap="round" />
    </>}

    {kind === 'share' && <>
      <path d="M11 31c0-11 9-20 21-20 12.5 0 22 9 22 20s-9.5 21-22 21c-3.3 0-6.5-.7-9.2-1.9L13 53l2.3-9.7A20 20 0 0 1 11 31Z" fill="var(--soft)" />
      <path d="M32 24V8m0 0-7 7m7-7 7 7" stroke="var(--brand)" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 31c0-2.5 2-4.5 4.5-4.5h25A4.5 4.5 0 0 1 49 31v12a4.5 4.5 0 0 1-4.5 4.5H29l-8 6v-6h-1.5A4.5 4.5 0 0 1 15 43V31Z" fill="white" stroke="var(--brand)" strokeWidth={2.2} strokeLinejoin="round" />
      <circle cx="25" cy="36.5" r="3" fill="var(--accent)" stroke="var(--brand)" strokeWidth={1.8} />
      <circle cx="34" cy="36.5" r="3" fill="var(--soft)" stroke="var(--brand)" strokeWidth={1.8} />
      <circle cx="43" cy="36.5" r="3" fill="var(--accent)" stroke="var(--brand)" strokeWidth={1.8} />
      <path d="m52 16 1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.5-1 2.5-1 1-2.6Z" fill="white" stroke="var(--brand)" strokeWidth={1.6} strokeLinejoin="round" />
    </>}

    {kind === 'connect' && <>
      <path d="M8 23c0-6 4.8-10 11-10h15c6.2 0 11 4 11 10v8c0 6-4.8 10-11 10h-7l-8 6v-6h-1c-6.2 0-10-4-10-10v-8Z" fill="var(--accent)" stroke="var(--brand)" strokeWidth={2.2} strokeLinejoin="round" />
      <path d="M23 34c0-6 4.8-10 11-10h11c6.2 0 11 4 11 10v8c0 6-4.8 10-11 10h-1v6l-8-6h-2c-6.2 0-11-4-11-10v-8Z" fill="white" stroke="var(--brand)" strokeWidth={2.2} strokeLinejoin="round" />
      <circle cx="22" cy="27" r="2" fill="white" />
      <circle cx="29" cy="27" r="2" fill="white" />
      <circle cx="36" cy="27" r="2" fill="white" />
      <circle cx="34" cy="37" r="2" fill="var(--accent)" />
      <circle cx="41" cy="37" r="2" fill="var(--accent)" />
      <circle cx="48" cy="37" r="2" fill="var(--accent)" />
    </>}
  </svg>;
}

type SignupLevel = 1 | 2 | 3 | 4;

/** Growth stages that represent a learner's comfort with sign language. */
export function SignupLevelArt({level}: {level: SignupLevel}) {
  return <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false">
    <path d="M8 34C8 20 18 9 32 9s24 11 24 25-10 20-24 20S8 48 8 34Z" fill="var(--soft)" />
    <path d="M10 49c7-4 15-6 22-6s15 2 22 6c-8 4-36 4-44 0Z" fill="var(--accent)" stroke="var(--brand)" strokeWidth={2.2} strokeLinejoin="round" />

    {level === 1 && <>
      <path d="M24 41c0-5 3.4-9 8-12 5 3 8 8 7 13-1 5-6 7-11 4-2-1-4-3-4-5Z" fill="white" stroke="var(--brand)" strokeWidth={2.2} strokeLinejoin="round" />
      <path d="M31 43c2-3 4-6 7-9" stroke="var(--accent)" strokeWidth={2.2} strokeLinecap="round" />
      <circle cx="19" cy="38" r="2" fill="white" />
      <circle cx="45" cy="37" r="2" fill="white" />
    </>}

    {level === 2 && <>
      <path d="M32 46c0-6 0-11 1-18" stroke="var(--brand)" strokeWidth={2.8} strokeLinecap="round" />
      <path d="M32 36c-7 0-11-4-11-9 6-2 12 1 13 7m0 1c1-7 6-11 12-10 0 6-4 10-12 12" fill="var(--accent)" stroke="var(--brand)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M26 47c2 1 4 1.5 6 1.5s4-.5 6-1.5" stroke="white" strokeWidth={1.8} strokeLinecap="round" />
    </>}

    {level === 3 && <>
      <path d="M32 46V23m0 13-10-8m10 3 9-9" stroke="var(--brand)" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M23 30c-6 0-10-4-10-9 6-2 12 1 13 7m15-7c1-6 6-9 11-8 0 6-4 10-11 11M31 25c-5-3-6-8-3-12 6 2 8 7 5 12" fill="var(--accent)" stroke="var(--brand)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 45c-2 1-4 1.5-6 1.5" stroke="white" strokeWidth={1.8} strokeLinecap="round" />
    </>}

    {level === 4 && <>
      <path d="M32 48V25m0 13-9-8m9 2 9-8" stroke="var(--brand)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M31 47h3v5h-3z" fill="white" stroke="var(--brand)" strokeWidth={2.2} strokeLinejoin="round" />
      <path d="M30 19c-1-6 3-11 9-11 5 0 8 4 7 9 6-1 10 3 10 8 0 5-4 8-9 8 1 5-3 9-8 9-4 0-7-2-8-6-4 4-10 3-13-1-3-4-1-9 3-11-4-4-3-10 1-13 3-2 6-2 8 0Z" fill="var(--accent)" stroke="var(--brand)" strokeWidth={2.2} strokeLinejoin="round" />
      <path d="M27 19c-2 3-3 6-3 9m14-14c-2 3-3 6-3 9m12-1c-3 2-5 5-6 8m-17 0c3 0 6 1 8 3" stroke="white" strokeWidth={1.8} strokeLinecap="round" />
    </>}
  </svg>;
}
