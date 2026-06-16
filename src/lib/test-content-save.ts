import {
  clearDescriptionOverride,
  saveDescriptionOverride,
  type TestDescriptionOverride,
} from "@/lib/test-plan";
import { isCustomTestContentId, resolveTestContentId } from "@/lib/platform-variants";
import { updateCustomTestContent } from "@/lib/custom-tests";

/** Save test content to the right store (custom_tests or test_results). */
export async function saveTestPlanContent(
  testId: string,
  ov: TestDescriptionOverride,
): Promise<boolean> {
  const contentId = resolveTestContentId(testId);
  if (isCustomTestContentId(contentId)) {
    return updateCustomTestContent(contentId, ov);
  }
  return saveDescriptionOverride(contentId, ov);
}

/** Clear built-in test overrides (not applicable to custom_tests rows). */
export async function clearTestPlanContent(testId: string): Promise<boolean> {
  const contentId = resolveTestContentId(testId);
  if (isCustomTestContentId(contentId)) return false;
  return clearDescriptionOverride(contentId);
}
