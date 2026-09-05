import { describe, expect, it } from "vitest";
import { allQaTestersForProgress } from "../gysh-roles";
import {
  contactForQaEmail,
  emailCountForContact,
  filterQaEmailLog,
  progressQaContacts,
  type ProgressEmailLogEntry,
} from "../daily-progress-emails";
import type { GyshUser } from "../gysh-roles";

function user(over: Partial<GyshUser> & Pick<GyshUser, "id" | "name" | "email">): GyshUser {
  return {
    role: over.role ?? "qa",
    roles: over.roles ?? ["qa"],
    status: over.status ?? "active",
    joinedAt: over.joinedAt ?? "2026-08-01",
    notes: over.notes ?? "",
    ...over,
  };
}

const sampleLog: ProgressEmailLogEntry[] = [
  {
    id: "el-1",
    templateSlug: "daily_digest",
    toEmail: "tinamariebarham@gmail.com",
    userId: "u-tina",
    subject: "GYSH daily digest",
    status: "sent",
    providerId: "re_1",
    error: "",
    createdAt: "2026-08-26T14:01:00.000Z",
  },
  {
    id: "el-2",
    templateSlug: "welcome",
    toEmail: "member@example.com",
    userId: "u-mem",
    subject: "Welcome",
    status: "sent",
    providerId: "re_2",
    error: "",
    createdAt: "2026-08-26T15:00:00.000Z",
  },
  {
    id: "el-3",
    templateSlug: "daily_digest",
    toEmail: "bremar00@comcast.net",
    userId: "u-brenda",
    subject: "GYSH daily digest",
    status: "sent",
    providerId: "re_3",
    error: "",
    createdAt: "2026-08-27T14:01:00.000Z",
  },
];

describe("allQaTestersForProgress", () => {
  it("keeps catalog QA testers and adds live QA users", () => {
    const list = allQaTestersForProgress([
      user({
        id: "u-brenda",
        name: "Brenda Marene Russell",
        email: "bremar00@comcast.net",
      }),
    ]);
    expect(list.map((t) => t.shortName)).toEqual([
      "Brenda",
      "Candace",
      "Evelyn",
      "Lyriq",
      "Tina",
    ]);
  });
});

describe("progressQaContacts + email log filter", () => {
  const users = [
    user({
      id: "u-brenda",
      name: "Brenda Marene Russell",
      email: "bremar00@comcast.net",
    }),
  ];

  it("attaches catalog and live QA emails", () => {
    const contacts = progressQaContacts(users);
    expect(contactForQaEmail("tinamariebarham@gmail.com", contacts)?.shortName).toBe("Tina");
    expect(contactForQaEmail("bremar00@comcast.net", contacts)?.shortName).toBe("Brenda");
    expect(contactForQaEmail("member@example.com", contacts)).toBeUndefined();
  });

  it("returns only emails sent to QA users, optionally by person and day", () => {
    const contacts = progressQaContacts(users);
    const all = filterQaEmailLog(sampleLog, contacts);
    expect(all.map((r) => r.id)).toEqual(["el-1", "el-3"]);
    expect(all[0]?.toName).toBe("Tina");
    expect(all[1]?.toName).toBe("Brenda");

    const tina = filterQaEmailLog(sampleLog, contacts, { people: ["Tina"] });
    expect(tina.map((r) => r.id)).toEqual(["el-1"]);

    const day = filterQaEmailLog(sampleLog, contacts, {
      from: "2026-08-27",
      to: "2026-08-27",
    });
    expect(day.map((r) => r.id)).toEqual(["el-3"]);
    expect(emailCountForContact(all, "Brenda")).toBe(1);
    expect(emailCountForContact(all, "Evelyn")).toBe(0);
  });
});
