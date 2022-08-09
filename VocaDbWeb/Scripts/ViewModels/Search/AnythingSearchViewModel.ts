import { EntryContract } from '@/DataContracts/EntryContract';
import { PartialFindResultContract } from '@/DataContracts/PartialFindResultContract';
import { EntryType } from '@/Models/EntryType';
import { EntryRepository } from '@/Repositories/EntryRepository';
import { EntryUrlMapper } from '@/Shared/EntryUrlMapper';
import { GlobalValues } from '@/Shared/GlobalValues';
import { SearchCategoryBaseViewModel } from '@/ViewModels/Search/SearchCategoryBaseViewModel';
import { SearchViewModel } from '@/ViewModels/Search/SearchViewModel';
import ko from 'knockout';

export class AnythingSearchViewModel extends SearchCategoryBaseViewModel<EntryContract> {
	public constructor(
		searchViewModel: SearchViewModel,
		values: GlobalValues,
		private entryRepo: EntryRepository,
	) {
		super(searchViewModel);

		this.loadResults = (
			pagingProperties,
			searchTerm,
			tags,
			childTags,
			status,
		): Promise<PartialFindResultContract<EntryContract>> =>
			this.entryRepo.getList({
				paging: pagingProperties,
				lang: values.languagePreference,
				query: searchTerm,
				tags: tags,
				childTags: childTags,
				fields: this.fields(),
				status: status,
			});
	}

	public entryCategoryName = (entry: EntryContract): string => {
		switch (EntryType[entry.entryType as keyof typeof EntryType]) {
			case EntryType.Artist:
				return this.searchViewModel.resources().artistTypeNames![
					entry.artistType!
				];
			case EntryType.Album:
				return this.searchViewModel.resources().discTypeNames![entry.discType!];
			case EntryType.ReleaseEvent:
				return this.searchViewModel.resources().eventCategoryNames![
					entry.eventCategory!
				];
			case EntryType.Song:
				return this.searchViewModel.resources().songTypeNames![entry.songType!];
		}

		return null!;
	};

	public entryUrl = (entry: EntryContract): string => {
		return EntryUrlMapper.details(entry.entryType, entry.id);
	};

	public fields = ko.computed(() =>
		this.searchViewModel.showTags()
			? 'AdditionalNames,MainPicture,Tags'
			: 'AdditionalNames,MainPicture',
	);
}
