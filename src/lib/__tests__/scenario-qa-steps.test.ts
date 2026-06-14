import { describe, it, expect } from 'vitest'
import { buildScenarioQaAuditSteps } from '../scenario-qa-steps'

describe('buildScenarioQaAuditSteps', () => {
  it('builds the updated wizard flow for SCEN-QA audits', () => {
    const steps = buildScenarioQaAuditSteps({
      birthYear: 'birth year = 1945 (age 81 in 2026)',
      zip3: '021',
      countyLine:
        'From the county dropdown that auto-populates for ZIP3=021, select Middlesex, MA — this scopes the carrier/plan check to only plans available in that county.',
      demographics:
        "gender = female, tobacco use = NO, income band = <$25k, cost preference = 'minimize monthly'",
      conditions: 'Hypertension, Type 2 Diabetes',
      medications:
        'Metformin 500 mg tablet (twice daily) = $8/mo; Lisinopril 10 mg tablet (daily) = $5/mo',
      costTotal: '$13/mo and $156/yr',
    })

    expect(steps[0]).toContain('Build My Scenario')
    expect(steps[1]).toContain('Step 1 — Basics')
    expect(steps[1]).toContain('THEN CLICK NEXT')
    expect(steps[2]).toContain('Enter the remaining for the Scenario Information')
    expect(steps[2]).toContain('THEN CLICK NEXT')
    expect(steps[3]).toContain('Step 2 — Conditions')
    expect(steps[4]).toContain('Common medications for your conditions')
    expect(steps[4]).toContain('THEN CLICK CREATE SCENARIO')
    expect(steps[5]).toContain('pop-up screen')
    expect(steps[5]).toContain('Contact Me')
    expect(steps[6]).toContain('Verify that an email was sent')
    expect(steps[11]).toContain('The total MUST equal $13/mo and $156/yr')
    expect(steps[11]).not.toContain('exactly')
    expect(steps[11]).toContain('do not fail the test')
  })
})
