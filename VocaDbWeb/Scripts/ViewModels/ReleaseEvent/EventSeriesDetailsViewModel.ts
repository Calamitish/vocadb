import TagSelectionContract from '@/DataContracts/Tag/TagSelectionContract';
import TagUsageForApiContract from '@/DataContracts/Tag/TagUsageForApiContract';
import EntryType from '@/Models/EntryType';
import UserRepository from '@/Repositories/UserRepository';
import TagListViewModel from '@/ViewModels/Tag/TagListViewModel';
import TagsEditViewModel from '@/ViewModels/Tag/TagsEditViewModel';

export default class EventSeriesDetailsViewModel {
	public constructor(
		private readonly userRepo: UserRepository,
		private readonly seriesId: number,
		tagUsages: TagUsageForApiContract[],
	) {
		this.tagsEditViewModel = new TagsEditViewModel(
			{
				getTagSelections: (): Promise<TagSelectionContract[]> =>
					userRepo.getEventSeriesTagSelections({ seriesId: this.seriesId }),
				saveTagSelections: (tags): Promise<void> =>
					userRepo
						.updateEventSeriesTags({ seriesId: this.seriesId, tags: tags })
						.then(this.tagUsages.updateTagUsages),
			},
			EntryType.ReleaseEvent /* Event series use event tags for now */,
		);

		this.tagUsages = new TagListViewModel(tagUsages);
	}

	public tagsEditViewModel: TagsEditViewModel;

	public tagUsages: TagListViewModel;
}
