import SongContract from '@/DataContracts/Song/SongContract';
import EntryMergeValidationHelper from '@/Helpers/EntryMergeValidationHelper';
import { SongAutoCompleteParams } from '@/KnockoutExtensions/AutoCompleteParams';
import SongRepository from '@/Repositories/SongRepository';
import GlobalValues from '@/Shared/GlobalValues';
import BasicEntryLinkViewModel from '@/ViewModels/BasicEntryLinkViewModel';
import ko from 'knockout';

export default class SongMergeViewModel {
	public constructor(
		values: GlobalValues,
		songRepo: SongRepository,
		private base: SongContract,
	) {
		this.target = new BasicEntryLinkViewModel<SongContract>(null!, (entryId) =>
			songRepo.getOne({ id: entryId, lang: values.languagePreference }),
		);

		this.targetSearchParams = {
			acceptSelection: this.target.id,
			ignoreId: base.id,
		};

		ko.computed(() => {
			var result = EntryMergeValidationHelper.validateEntry(
				this.base,
				this.target.entry(),
			);
			this.validationError_targetIsLessComplete(
				result.validationError_targetIsLessComplete,
			);
			this.validationError_targetIsNewer(result.validationError_targetIsNewer);
		});

		/*this.validationError_targetIsLessComplete = ko.computed(helpers.EntryMergeValidationHelper.() => this.target.entry() &&
				models.EntryStatus[this.target.entry().status] < models.EntryStatus[this.base.status]);

			this.validationError_targetIsNewer = ko.computed(() => this.target.entry() &&
				moment(this.target.entry().createDate) > moment(this.base.createDate));*/
	}

	public target: BasicEntryLinkViewModel<SongContract>;
	public targetSearchParams: SongAutoCompleteParams;

	public validationError_targetIsLessComplete = ko.observable(false);
	public validationError_targetIsNewer = ko.observable(false);

	//public validationError_targetIsLessComplete: Observable<boolean>;
	//public validationError_targetIsNewer: Observable<boolean>;
}
