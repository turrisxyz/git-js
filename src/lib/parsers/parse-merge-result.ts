import { MergeDetail, MergeResult } from '../../../typings';
import { LineParser, parseLinesWithContent } from '../utils';
import { TaskParser } from '../tasks/task';
import { parsePullResult } from '../responses/PullSummary';
import { MergeSummaryConflict, MergeSummaryDetail } from '../responses/MergeSummary';

const parsers: LineParser<MergeDetail>[] = [
   new LineParser(/^Auto-merging\s+(.+)$/, (summary, [autoMerge]) => {
      summary.merges.push(autoMerge);
   }),
   new LineParser(/^CONFLICT\s+\((.+)\): Merge conflict in (.+)$/, (summary, [reason, file]) => {
      summary.conflicts.push(new MergeSummaryConflict(reason, file));
   }),
   new LineParser(/^CONFLICT\s+\((.+\/delete)\): (.+) deleted in (.+) and/, (summary, [reason, file, deleteRef]) => {
      summary.conflicts.push(new MergeSummaryConflict(reason, file, {deleteRef}));
   }),
   new LineParser(/^CONFLICT\s+\((.+)\):/, (summary, [reason]) => {
      summary.conflicts.push(new MergeSummaryConflict(reason, null));
   }),
   new LineParser(/^Automatic merge failed;\s+(.+)$/, (summary, [result]) => {
      summary.result = result;
   }),
];

/**
 * Parse the complete response from `git.merge`
 */
export const parseMergeResult: TaskParser<string, MergeResult> = (stdOut, stdErr) => {
   return Object.assign(
      parseMergeDetail(stdOut, stdErr),
      parsePullResult(stdOut, stdErr),
   );
};

/**
 * Parse the merge specific detail (ie: not the content also available in the pull detail) from `git.mnerge`
 * @param stdOut
 */
export const parseMergeDetail: TaskParser<string, MergeDetail> = (stdOut) => {
   return parseLinesWithContent(new MergeSummaryDetail(), parsers, stdOut);
}
