import TagBaseContract from '@DataContracts/Tag/TagBaseContract';
import TagRepository from '@Repositories/TagRepository';
import GlobalValues from '@Shared/GlobalValues';
import _ from 'lodash';
import {
	action,
	computed,
	makeObservable,
	observable,
	runInAction,
} from 'mobx';

import TagFilter from './TagFilter';

// Manages tag filters for search
export default class TagFilters {
	@observable public childTags = false;
	@observable public tags: TagFilter[] = [];

	public constructor(
		private readonly values: GlobalValues,
		private readonly tagRepo: TagRepository,
		tags?: TagFilter[],
	) {
		makeObservable(this);

		this.tags = tags || [];
	}

	@computed public get tagIds(): number[] {
		return this.tags.map((t) => t.id);
	}

	// Fired when any of the tag filters is changed
	@computed public get filters(): any {
		return {
			tagIds: this.tagIds,
			childTags: this.childTags,
		};
	}

	@action public addTag = (tag: TagBaseContract): number =>
		this.tags.push(TagFilter.fromContract(tag));

	@action public addTags = (selectedTagIds: number[]): void => {
		if (!selectedTagIds) return;

		const filters = selectedTagIds.map((a) => new TagFilter(a));
		this.tags.push(...filters);

		if (!this.tagRepo) return;

		_.forEach(filters, (newTag) => {
			const selectedTagId = newTag.id;

			this.tagRepo
				.getById({
					id: selectedTagId,
					fields: undefined,
					lang: this.values.languagePreference,
				})
				.then((tag) => {
					runInAction(() => {
						newTag.name = tag.name;
						newTag.urlSlug = tag.urlSlug;
					});
				});
		});
	};

	@action public removeTag = (tag: TagFilter): void => {
		_.pull(this.tags, tag);
	};
}
