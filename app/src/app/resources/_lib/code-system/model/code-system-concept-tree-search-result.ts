import {SearchResult} from '@termx-health/core-util';
import {CodeSystemConceptTreeItem} from 'term-web/resources/_lib/code-system/model/code-system-concept-tree-item';

export interface CodeSystemConceptTreeSearchResult extends SearchResult<CodeSystemConceptTreeItem> {
  matchedCount?: number;
}
