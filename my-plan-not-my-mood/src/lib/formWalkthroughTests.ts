/**
 * Angela walkthroughs for the public Contact form and mailing-list sign-up.
 * Current sprint: Sprint 3. Use DEMO DATA / TEST USER — never a real personal inbox.
 */

import { TODAYS_NEW_TEST_PARENT_DUE, TODAYS_NEW_TEST_SPRINT, dueDateForTodaysNewTest } from './todaysReviewDueDates';

export const FORM_WALKTHROUGH_TASK_ID = 't-205';
export const FORM_WALKTHROUGH_SPRINT = TODAYS_NEW_TEST_SPRINT;
export const FORM_WALKTHROUGH_ASSIGNEE = 'angela' as const;
export const FORM_CONTACT_TEST_ID = 'form-contact';
export const FORM_SIGNUP_TEST_ID = 'form-signup';
export const FORM_CONTACT_HREF = '/contact';
export const FORM_SIGNUP_HREF = '/#mailing-list';
export const FORM_DEMO_EMAIL = 'tester@example.com';
export const FORM_DEMO_NAME = 'TEST USER';

export type FormWalkthroughQaSeed = {
  id: string;
  title: string;
  desc: string;
  sprint: typeof FORM_WALKTHROUGH_SPRINT;
  phase: 'Phase 1';
  category: 'Storefront QA';
  priority: 'high';
  status: 'untested';
  assignee: typeof FORM_WALKTHROUGH_ASSIGNEE;
  assignor: 'evelyn';
  dueDate: string;
};

export type FormWalkthroughContentSeed = {
  description: string;
  steps: Array<string | { label: string; href?: string }>;
};

export type FormWalkthroughSpec = {
  id: string;
  title: string;
  path: string;
  desc: string;
  steps: Array<string | { label: string; href?: string }>;
};

export const FORM_WALKTHROUGH_SPECS: FormWalkthroughSpec[] = [
  {
    id: FORM_CONTACT_TEST_ID,
    title: 'Contact Us form — send a note',
    path: FORM_CONTACT_HREF,
    desc: 'Angela submits the Contact Send a note form with DEMO DATA and confirms validation, success or email-app fallback, and that phone / full address / DOB are not requested.',
    steps: [
      { label: 'Open Contact', href: FORM_CONTACT_HREF },
      'Confirm Send a note shows Name, Email, Subject, and Message — no phone, full address, or date of birth',
      'Submit empty and confirm an error appears',
      `Fill DEMO DATA / TEST USER: name ${FORM_DEMO_NAME}, email ${FORM_DEMO_EMAIL}, a subject, and a message of at least 10 characters, then Submit`,
      'Confirm success (We received your note) or the Open email app fallback — do not use a real personal inbox',
      'On a phone-width (~320px), confirm no horizontal scroll and Submit is at least 44×44',
    ],
  },
  {
    id: FORM_SIGNUP_TEST_ID,
    title: 'Email Sign Up form — mailing list',
    path: FORM_SIGNUP_HREF,
    desc: 'Angela tests mailing-list sign-up on Home and Contact: valid DEMO DATA email, reject empty/invalid/duplicate, optional first name only, not a membership.',
    steps: [
      { label: 'Open the Home mailing list', href: FORM_SIGNUP_HREF },
      'Confirm first name is optional, email is required, and copy says this is not a membership',
      'Submit empty and confirm Email is required',
      'Submit an invalid email and confirm it is rejected',
      `Sign up with DEMO DATA / TEST USER: optional first name ${FORM_DEMO_NAME} and email ${FORM_DEMO_EMAIL}`,
      'Confirm success says you are on the list and this did not create a membership',
      'Submit the same email again and confirm the duplicate is rejected',
      { label: 'Open Contact and confirm the same mailing list form is present', href: FORM_CONTACT_HREF },
      'Confirm Join / Memberships stays Coming Soon and the form does not collect phone or address',
    ],
  },
];

export function formWalkthroughTestIds(): string[] {
  return FORM_WALKTHROUGH_SPECS.map((spec) => spec.id);
}

export function formWalkthroughTestCount(): number {
  return FORM_WALKTHROUGH_SPECS.length;
}

export function formWalkthroughTaskTitle(count = formWalkthroughTestCount()): string {
  return `Contact and Email Sign-Up Forms (${count} tests)`;
}

export function buildFormWalkthroughQaSeeds(): FormWalkthroughQaSeed[] {
  return FORM_WALKTHROUGH_SPECS.map((spec, index) => ({
    id: spec.id,
    title: spec.title,
    desc: spec.desc,
    sprint: FORM_WALKTHROUGH_SPRINT,
    phase: 'Phase 1',
    category: 'Storefront QA',
    priority: 'high',
    status: 'untested',
    assignee: FORM_WALKTHROUGH_ASSIGNEE,
    assignor: 'evelyn',
    dueDate: dueDateForTodaysNewTest(index),
  }));
}

export function buildFormWalkthroughTask(): {
  id: string;
  title: string;
  sprint: typeof FORM_WALKTHROUGH_SPRINT;
  phase: 'Phase 1';
  category: 'QA & Testing';
  priority: 'high';
  status: 'not_started';
  assignee: typeof FORM_WALKTHROUGH_ASSIGNEE;
  assignor: 'evelyn';
  dueDate: string;
} {
  return {
    id: FORM_WALKTHROUGH_TASK_ID,
    title: formWalkthroughTaskTitle(),
    sprint: FORM_WALKTHROUGH_SPRINT,
    phase: 'Phase 1',
    category: 'QA & Testing',
    priority: 'high',
    status: 'not_started',
    assignee: FORM_WALKTHROUGH_ASSIGNEE,
    assignor: 'evelyn',
    dueDate: TODAYS_NEW_TEST_PARENT_DUE,
  };
}

export function formWalkthroughTaskContent(): FormWalkthroughContentSeed {
  const count = formWalkthroughTestCount();
  return {
    description: `Angela tests the public Contact Us form and the Email Sign Up (mailing list) form. ${count} tests are attached. Use DEMO DATA / TEST USER only.`,
    steps: [
      { label: 'Open Contact and start the Contact Us form test', href: FORM_CONTACT_HREF },
      { label: 'Open Home and start the Email Sign Up / mailing list test', href: FORM_SIGNUP_HREF },
      `Open Testing Portal and work the ${count} linked form tests on this task`,
    ],
  };
}

export function formWalkthroughPageHrefs(): Record<string, string> {
  return {
    [FORM_WALKTHROUGH_TASK_ID]: FORM_CONTACT_HREF,
    ...Object.fromEntries(FORM_WALKTHROUGH_SPECS.map((spec) => [spec.id, spec.path])),
  };
}

export function formWalkthroughQaContent(): Record<string, FormWalkthroughContentSeed> {
  return Object.fromEntries(
    FORM_WALKTHROUGH_SPECS.map((spec) => [
      spec.id,
      { description: spec.desc, steps: spec.steps },
    ]),
  );
}
