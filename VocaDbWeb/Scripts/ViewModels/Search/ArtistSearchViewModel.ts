import { ArtistApiContract } from '@/DataContracts/Artist/ArtistApiContract';
import { ArtistContract } from '@/DataContracts/Artist/ArtistContract';
import { PartialFindResultContract } from '@/DataContracts/PartialFindResultContract';
import { ArtistHelper } from '@/Helpers/ArtistHelper';
import { ArtistType } from '@/Models/Artists/ArtistType';
import {
	ArtistOptionalField,
	ArtistRepository,
} from '@/Repositories/ArtistRepository';
import { GlobalValues } from '@/Shared/GlobalValues';
import { SearchCategoryBaseViewModel } from '@/ViewModels/Search/SearchCategoryBaseViewModel';
import { SearchViewModel } from '@/ViewModels/Search/SearchViewModel';
import ko from 'knockout';

export class ArtistSearchViewModel extends SearchCategoryBaseViewModel<ArtistApiContract> {
	public constructor(
		searchViewModel: SearchViewModel,
		values: GlobalValues,
		private readonly artistRepo: ArtistRepository,
		/* TODO: remove */ private readonly loggedUserId: number,
		artistType: ArtistType,
	) {
		super(searchViewModel);

		if (artistType) this.artistType(artistType);

		this.advancedFilters.filters.subscribe(this.updateResultsWithTotalCount);
		this.sort.subscribe(this.updateResultsWithTotalCount);
		this.artistType.subscribe(this.updateResultsWithTotalCount);
		this.onlyFollowedByMe.subscribe(this.updateResultsWithTotalCount);
		this.onlyRootVoicebanks.subscribe(this.updateResultsWithTotalCount);

		this.loadResults = (
			pagingProperties,
			searchTerm,
			tags,
			childTags,
			status,
		): Promise<PartialFindResultContract<ArtistContract>> =>
			this.artistRepo.getList({
				paging: pagingProperties,
				lang: values.languagePreference,
				query: searchTerm,
				sort: this.sort(),
				artistTypes:
					this.artistType() !== ArtistType.Unknown
						? [this.artistType()]
						: undefined,
				allowBaseVoicebanks: !this.onlyRootVoicebanks(),
				tags: tags,
				childTags: childTags,
				followedByUserId: this.onlyFollowedByMe()
					? values.loggedUserId
					: undefined,
				fields: this.fields(),
				status: status,
				advancedFilters: this.advancedFilters.filters(),
			});
	}

	public artistTypeName = (artist: ArtistApiContract): string => {
		return this.searchViewModel.resources().artistTypeNames![artist.artistType];
	};

	public artistType = ko.observable(ArtistType.Unknown);
	public onlyFollowedByMe = ko.observable(false);
	public onlyRootVoicebanks = ko.observable(false);
	public showTags = ko.observable(false);
	public sort = ko.observable('Name');
	public sortName = ko.computed(() =>
		this.searchViewModel.resources().artistSortRuleNames != null
			? this.searchViewModel.resources().artistSortRuleNames![this.sort()]
			: '',
	);

	public canHaveChildVoicebanks = ko.computed(() =>
		ArtistHelper.canHaveChildVoicebanks(this.artistType()),
	);

	public fields = ko.computed(() =>
		this.searchViewModel.showTags()
			? [
					ArtistOptionalField.AdditionalNames,
					ArtistOptionalField.MainPicture,
					ArtistOptionalField.Tags,
			  ]
			: [ArtistOptionalField.AdditionalNames, ArtistOptionalField.MainPicture],
	);
}
