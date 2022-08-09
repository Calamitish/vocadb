import { PartialFindResultContract } from '@/DataContracts/PartialFindResultContract';
import { SongApiContract } from '@/DataContracts/Song/SongApiContract';
import { SongContract } from '@/DataContracts/Song/SongContract';
import { KnockoutHelper } from '@/Helpers/KnockoutHelper';
import { IEntryWithIdAndName } from '@/Models/IEntryWithIdAndName';
import { PVServiceIcons } from '@/Models/PVServiceIcons';
import { ResourcesManager } from '@/Models/ResourcesManager';
import { SongType } from '@/Models/Songs/SongType';
import { ArtistRepository } from '@/Repositories/ArtistRepository';
import { ReleaseEventRepository } from '@/Repositories/ReleaseEventRepository';
import { ResourceRepository } from '@/Repositories/ResourceRepository';
import { SongRepository } from '@/Repositories/SongRepository';
import { UserRepository } from '@/Repositories/UserRepository';
import { GlobalValues } from '@/Shared/GlobalValues';
import { ui } from '@/Shared/MessagesTyped';
import { UrlMapper } from '@/Shared/UrlMapper';
import { BasicEntryLinkViewModel } from '@/ViewModels/BasicEntryLinkViewModel';
import { PVPlayerViewModel } from '@/ViewModels/PVs/PVPlayerViewModel';
import { PVPlayersFactory } from '@/ViewModels/PVs/PVPlayersFactory';
import { ArtistFilters } from '@/ViewModels/Search/ArtistFilters';
import { SearchCategoryBaseViewModel } from '@/ViewModels/Search/SearchCategoryBaseViewModel';
import { SearchViewModel } from '@/ViewModels/Search/SearchViewModel';
import { PlayListRepositoryForSongsAdapter } from '@/ViewModels/Song/PlayList/PlayListRepositoryForSongsAdapter';
import { PlayListViewModel } from '@/ViewModels/Song/PlayList/PlayListViewModel';
import { SongWithPreviewViewModel } from '@/ViewModels/Song/SongWithPreviewViewModel';
import ko, { Computed, Observable } from 'knockout';
import moment from 'moment';

export class SongSearchViewModel extends SearchCategoryBaseViewModel<ISongSearchItem> {
	public constructor(
		searchViewModel: SearchViewModel,
		values: GlobalValues,
		urlMapper: UrlMapper,
		private songRepo: SongRepository,
		private artistRepo: ArtistRepository,
		private userRepo: UserRepository,
		private eventRepo: ReleaseEventRepository,
		resourceRep: ResourceRepository,
		/* TODO: remove */ private loggedUserId: number,
		sort: string,
		artistId: number[],
		childVoicebanks: boolean,
		songType: SongType,
		eventId: number,
		onlyWithPVs: boolean,
		onlyRatedSongs: boolean,
		since: number,
		minScore: number,
		viewMode: string,
		autoplay: boolean,
		shuffle: boolean,
		pvPlayersFactory: PVPlayersFactory,
	) {
		super(searchViewModel);

		if (searchViewModel) {
			this.resourceManager = searchViewModel.resourcesManager;
			this.showTags = this.searchViewModel.showTags;
		} else {
			this.resourceManager = new ResourcesManager(
				resourceRep,
				values.uiCulture,
			);
			this.resourceManager.loadResources('songSortRuleNames');
			this.showTags = ko.observable(false);
		}

		this.pvServiceIcons = new PVServiceIcons(urlMapper);

		this.artistFilters = new ArtistFilters(
			values,
			this.artistRepo,
			childVoicebanks,
		);
		this.artistFilters.selectArtists(artistId);

		this.releaseEvent = new BasicEntryLinkViewModel<IEntryWithIdAndName>(
			{ id: eventId, name: null! },
			(entryId) =>
				this.eventRepo
					? this.eventRepo.getOne({ id: entryId })
					: Promise.resolve(undefined),
		);

		if (eventId) this.releaseEvent.id(eventId);

		if (sort) this.sort(sort);

		if (songType) this.songType(songType);

		if (onlyWithPVs) this.pvsOnly(onlyWithPVs);

		if (onlyRatedSongs) this.onlyRatedSongs(onlyRatedSongs);

		this.minScore = ko
			.observable(minScore || undefined!)
			.extend({ rateLimit: { timeout: 300, method: 'notifyWhenChangesStop' } });
		this.since = ko.observable(since);
		this.viewMode = ko.observable(viewMode || 'Details');

		this.parentVersion = new BasicEntryLinkViewModel<IEntryWithIdAndName>(
			null!,
			(entryId) =>
				this.songRepo.getOne({
					id: entryId,
					lang: values.languagePreference,
				}),
		);

		this.minMilliBpm = ko
			.observable(undefined!)
			.extend({ rateLimit: { timeout: 300, method: 'notifyWhenChangesStop' } });
		this.maxMilliBpm = ko
			.observable(undefined!)
			.extend({ rateLimit: { timeout: 300, method: 'notifyWhenChangesStop' } });

		this.minLength = ko
			.observable(0)
			.extend({ rateLimit: { timeout: 300, method: 'notifyWhenChangesStop' } });
		this.maxLength = ko
			.observable(0)
			.extend({ rateLimit: { timeout: 300, method: 'notifyWhenChangesStop' } });

		this.advancedFilters.filters.subscribe(this.updateResultsWithTotalCount);
		this.artistFilters.filters.subscribe(this.updateResultsWithTotalCount);
		this.afterDate.subscribe(this.updateResultsWithTotalCount);
		this.releaseEvent.subscribe(this.updateResultsWithTotalCount);
		this.minScore.subscribe(this.updateResultsWithTotalCount);
		this.onlyRatedSongs.subscribe(this.updateResultsWithTotalCount);
		this.parentVersion.subscribe(this.updateResultsWithTotalCount);
		this.pvPlayerViewModel = new PVPlayerViewModel(
			values,
			urlMapper,
			songRepo,
			userRepo,
			pvPlayersFactory,
			autoplay,
			shuffle,
		);
		this.pvsOnly.subscribe(this.updateResultsWithTotalCount);
		this.since.subscribe(this.updateResultsWithTotalCount);
		this.songType.subscribe(this.updateResultsWithTotalCount);
		this.sort.subscribe(this.updateResultsWithTotalCount);
		this.unifyEntryTypesAndTags.subscribe(this.updateResultsWithTotalCount);
		this.viewMode.subscribe(this.updateResultsWithTotalCount);
		this.minMilliBpm.subscribe(this.updateResultsWithTotalCount);
		this.maxMilliBpm.subscribe(this.updateResultsWithTotalCount);
		this.minLength.subscribe(this.updateResultsWithTotalCount);
		this.maxLength.subscribe(this.updateResultsWithTotalCount);

		this.sortName = ko.computed(() =>
			this.resourceManager.resources().songSortRuleNames != null
				? this.resourceManager.resources().songSortRuleNames![this.sort()]
				: '',
		);

		var songsRepoAdapter = new PlayListRepositoryForSongsAdapter(
			songRepo,
			this.searchTerm,
			this.sort,
			this.songType,
			this.afterDate,
			this.beforeDate,
			this.tagIds,
			this.childTags,
			this.unifyEntryTypesAndTags,
			this.artistFilters.artistIds,
			this.artistFilters.artistParticipationStatus,
			this.artistFilters.childVoicebanks,
			this.artistFilters.includeMembers,
			this.releaseEvent.id,
			this.pvsOnly,
			this.since,
			this.minScore,
			this.onlyRatedSongs,
			values.loggedUserId,
			this.parentVersion.id,
			this.fields,
			this.draftsOnly,
			this.advancedFilters.filters,
		);

		this.playListViewModel = new PlayListViewModel(
			values,
			urlMapper,
			songsRepoAdapter,
			songRepo,
			userRepo,
			this.pvPlayerViewModel,
		);

		this.loadResults = (
			pagingProperties,
			searchTerm,
			tag,
			childTags,
			status,
		): Promise<PartialFindResultContract<SongContract>> => {
			if (this.viewMode() === 'PlayList') {
				this.playListViewModel.updateResultsWithTotalCount();
				return Promise.resolve({ items: [], totalCount: 0 });
			} else {
				return this.songRepo
					.getList({
						paging: pagingProperties,
						lang: values.languagePreference,
						query: searchTerm,
						sort: this.sort(),
						songTypes:
							this.songType() !== SongType.Unspecified
								? [this.songType()]
								: undefined,
						afterDate: this.afterDate(),
						beforeDate: this.beforeDate(),
						tagIds: tag,
						childTags: childTags,
						unifyTypesAndTags: this.unifyEntryTypesAndTags(),
						artistIds: this.artistFilters.artistIds(),
						artistParticipationStatus: this.artistFilters.artistParticipationStatus(),
						childVoicebanks: this.artistFilters.childVoicebanks(),
						includeMembers: this.artistFilters.includeMembers(),
						eventId: this.releaseEvent.id(),
						onlyWithPvs: this.pvsOnly(),
						pvServices: undefined,
						since: this.since(),
						minScore: this.minScore(),
						userCollectionId: this.onlyRatedSongs()
							? values.loggedUserId
							: undefined,
						parentSongId: this.parentVersion.id(),
						fields: this.fields(),
						status: status,
						advancedFilters: this.advancedFilters.filters(),
						minMilliBpm: this.minMilliBpm(),
						maxMilliBpm: this.maxMilliBpm(),
						minLength: this.minLength() ? this.minLength() : undefined,
						maxLength: this.maxLength() ? this.maxLength() : undefined,
					})
					.then((result) => {
						for (const song of result.items as ISongSearchItem[]) {
							if (song.pvServices && song.pvServices !== 'Nothing') {
								song.previewViewModel = new SongWithPreviewViewModel(
									this.songRepo,
									this.userRepo,
									song.id,
									song.pvServices,
								);
								song.previewViewModel.ratingComplete =
									ui.showThankYouForRatingMessage;
							} else {
								song.previewViewModel = null!;
							}
						}

						return result;
					});
			}
		};

		this.minBpm = KnockoutHelper.bpm(this.minMilliBpm);

		this.maxBpm = KnockoutHelper.bpm(this.maxMilliBpm);

		this.minLengthFormatted = KnockoutHelper.lengthFormatted(this.minLength);

		this.maxLengthFormatted = KnockoutHelper.lengthFormatted(this.maxLength);
	}

	public artistFilters: ArtistFilters;
	public dateDay = ko.observable<number>(null!);
	public dateMonth = ko.observable<number>(null!);
	public dateYear = ko.observable<number>(null!);
	public releaseEvent: BasicEntryLinkViewModel<IEntryWithIdAndName>;
	public minScore: Observable<number>;
	public onlyRatedSongs = ko.observable(false);
	public parentVersion: BasicEntryLinkViewModel<IEntryWithIdAndName>;
	public playListViewModel: PlayListViewModel;
	public pvPlayerViewModel: PVPlayerViewModel;
	public pvsOnly = ko.observable(false);
	private pvServiceIcons: PVServiceIcons;
	private resourceManager: ResourcesManager;
	public since: Observable<number>;
	public songType = ko.observable(SongType.Unspecified);
	public sort = ko.observable('Name');
	public sortName: Computed<string>;
	public unifyEntryTypesAndTags = ko.observable(false);
	public viewMode: Observable<string>;
	public minMilliBpm: Observable<number>;
	public maxMilliBpm: Observable<number>;
	public minBpm: Computed<string>;
	public maxBpm: Computed<string>;
	public minLength: Observable<number>;
	public maxLength: Observable<number>;
	public minLengthFormatted: Computed<string>;
	public maxLengthFormatted: Computed<string>;

	// Remember, JavaScript months start from 0 (who came up with that??)
	private toDateOrNull = (mom: moment.Moment): Date | null =>
		mom.isValid() ? mom.toDate() : null;

	private afterDate = ko
		.computed(() =>
			this.dateYear()
				? this.toDateOrNull(
						moment.utc([
							this.dateYear()!,
							(this.dateMonth() || 1) - 1,
							this.dateDay() || 1,
						]),
				  )!
				: null!,
		)
		.extend({ rateLimit: { timeout: 300, method: 'notifyWhenChangesStop' } });

	private beforeDate = (): Date => {
		if (!this.dateYear()) return null!;

		var mom = moment.utc([
			this.dateYear()!,
			(this.dateMonth() || 12) - 1,
			this.dateDay() || 1,
		]);

		return this.toDateOrNull(
			this.dateMonth() && this.dateDay() ? mom.add(1, 'd') : mom.add(1, 'M'),
		)!;
	};

	public fields = ko.computed<string>(() =>
		this.showTags()
			? 'AdditionalNames,ThumbUrl,Tags'
			: 'AdditionalNames,ThumbUrl',
	);

	public getPVServiceIcons = (
		services: string,
	): { service: string; url: string }[] => {
		return this.pvServiceIcons.getIconUrls(services);
	};

	public showTags: Observable<boolean>;

	public showUnifyEntryTypesAndTags = ko.computed(
		() =>
			this.songType() !== SongType.Unspecified &&
			this.songType() !== SongType.Original,
	);
}

export interface ISongSearchItem extends SongApiContract {
	previewViewModel?: SongWithPreviewViewModel;
}
