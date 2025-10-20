import { QuartzPluginData } from "../../quartz/plugins/vfile";
import { FileTrieNode } from "../../quartz/util/fileTrie";

export const notesFilterForIndex = (file: QuartzPluginData) => {
	if (file.frontmatter && file.frontmatter["disable-index"]) {
		return file.frontmatter["disable-index"] !== true;
	}
	return true;
};

export const notesFilter = (file: QuartzPluginData) => {
	return notesFilterForIndex(file);
};

export const topicFilter = (fileNode: FileTrieNode) => {
	if (fileNode.slugSegment === "almanac") {
		return false;
	}
	return true;
};
