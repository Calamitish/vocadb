import { ArtistContract } from '@/DataContracts/Artist/ArtistContract';
import { ArtistForArtistContract } from '@/DataContracts/Artist/ArtistForArtistContract';
import { ArtistForEditContract } from '@/DataContracts/Artist/ArtistForEditContract';
import { TranslatedEnumField } from '@/DataContracts/TranslatedEnumField';
import { ArtistHelper } from '@/Helpers/ArtistHelper';
import { ArtistAutoCompleteParams } from '@/KnockoutExtensions/AutoCompleteParams';
import { ArtistType } from '@/Models/Artists/ArtistType';
import { EntryType } from '@/Models/EntryType';
import { ArtistRepository } from '@/Repositories/ArtistRepository';
import { UserRepository } from '@/Repositories/UserRepository';
import { IDialogService } from '@/Shared/DialogService';
import { GlobalValues } from '@/Shared/GlobalValues';
import { UrlMapper } from '@/Shared/UrlMapper';
import { BasicEntryLinkViewModel } from '@/ViewModels/BasicEntryLinkViewModel';
import { DeleteEntryViewModel } from '@/ViewModels/DeleteEntryViewModel';
import { EntryPictureFileListEditViewModel } from '@/ViewModels/EntryPictureFileListEditViewModel';
import { EnglishTranslatedStringEditViewModel } from '@/ViewModels/Globalization/EnglishTranslatedStringEditViewModel';
import { NamesEditViewModel } from '@/ViewModels/Globalization/NamesEditViewModel';
import { WebLinksEditViewModel } from '@/ViewModels/WebLinksEditViewModel';
import $ from 'jquery';
import ko, { Computed, Observable, ObservableArray } from 'knockout';
import moment from 'moment';

export class ArtistEditViewModel {
	public addAssociatedArtist = (): void => {
		if (this.newAssociatedArtist.isEmpty()) return;

		this.associatedArtists.push(
			new ArtistForArtistEditViewModel({
				parent: this.newAssociatedArtist.entry(),
				linkType: this.newAssociatedArtistType(),
			}),
		);

		this.newAssociatedArtist.clear();
	};

	private addGroup = (artistId?: number): void => {
		if (artistId) {
			this.artistRepo
				.getOne({ id: artistId, lang: this.values.languagePreference })
				.then((artist: ArtistContract) => {
					this.groups.push({ id: 0, parent: artist });
				});
		}
	};

	public artistType: Computed<ArtistType>;
	public artistTypeStr: Observable<ArtistType>;
	public allowBaseVoicebank: Computed<boolean>;
	public associatedArtists: ObservableArray<ArtistForArtistEditViewModel>;
	public baseVoicebank: BasicEntryLinkViewModel<ArtistContract>;
	public baseVoicebankSearchParams: ArtistAutoCompleteParams;
	public canHaveCircles: Computed<boolean>;
	// Can have related artists (associatedArtists) such as voice provider and illustrator
	public canHaveRelatedArtists: Computed<boolean>;
	public canHaveReleaseDate: Computed<boolean>;

	// Clears fields that are not valid for the selected artist type.
	private clearInvalidData = (): void => {
		if (!this.canHaveReleaseDate()) {
			this.releaseDate(null!);
		}

		if (!this.canHaveRelatedArtists()) {
			this.associatedArtists([]);
		}

		if (!this.allowBaseVoicebank()) {
			this.baseVoicebank.clear();
		}

		if (!this.canHaveCircles()) {
			this.groups([]);
		}
	};

	public defaultNameLanguage: Observable<string>;

	public deleteViewModel = new DeleteEntryViewModel((notes) => {
		$.ajax(
			this.urlMapper.mapRelative(
				'api/artists/' + this.id + '?notes=' + encodeURIComponent(notes),
			),
			{
				type: 'DELETE',
				success: () => {
					window.location.href = this.urlMapper.mapRelative(
						'/Artist/Details/' + this.id,
					);
				},
			},
		);
	});

	public description: EnglishTranslatedStringEditViewModel;
	public groups: ObservableArray<ArtistForArtistContract>;

	public groupSearchParams: ArtistAutoCompleteParams = {
		acceptSelection: this.addGroup,
		extraQueryParams: {
			artistTypes: [
				ArtistType.Label,
				ArtistType.Circle,
				ArtistType.OtherGroup,
				ArtistType.Band,
			].join(','),
		},
		height: 300,
	};

	public hasValidationErrors: Computed<boolean>;
	public id: number;
	public illustrator: BasicEntryLinkViewModel<ArtistContract>;

	public names: NamesEditViewModel;
	public newAssociatedArtist: BasicEntryLinkViewModel<ArtistContract>;
	public newAssociatedArtistType = ko.observable<string>();
	public pictures: EntryPictureFileListEditViewModel;
	public releaseDate: Observable<Date>;

	public removeGroup = (group: ArtistForArtistContract): void => {
		this.groups.remove(group);
	};

	public status: Observable<string>;

	public submit = (): boolean => {
		if (
			this.hasValidationErrors() &&
			this.status() !== 'Draft' &&
			this.dialogService.confirm(vdb.resources.entryEdit.saveWarning) === false
		) {
			return false;
		}

		this.clearInvalidData();

		this.submitting(true);

		var submittedModel: ArtistForEditContract = {
			artistType: this.artistTypeStr(),
			associatedArtists: this.associatedArtists().map((a) => a.toContract()),
			baseVoicebank: this.baseVoicebank.entry(),
			defaultNameLanguage: this.defaultNameLanguage(),
			description: this.description.toContract(),
			groups: this.groups(),
			id: this.id,
			illustrator: this.illustrator.entry(),
			names: this.names.toContracts(),
			pictures: this.pictures.toContracts(),
			releaseDate: this.releaseDate()
				? this.releaseDate().toISOString()
				: null!,
			status: this.status(),
			updateNotes: this.updateNotes(),
			voiceProvider: this.voiceProvider.entry(),
			webLinks: this.webLinks.toContracts(),
			pictureMime: '',
		};

		this.submittedJson(ko.toJSON(submittedModel));

		return true;
	};

	public submittedJson = ko.observable('');

	public submitting = ko.observable(false);
	public updateNotes = ko.observable('');
	public validationExpanded = ko.observable(false);
	public validationError_needReferences: Computed<boolean>;
	public validationError_needType: Computed<boolean>;
	public validationError_unnecessaryPName: Computed<boolean>;
	public validationError_unspecifiedNames: Computed<boolean>;
	public voiceProvider: BasicEntryLinkViewModel<ArtistContract>;
	public webLinks: WebLinksEditViewModel;

	private canHaveBaseVoicebank(at: ArtistType): boolean {
		return (
			(ArtistHelper.isVocalistType(at) || at === ArtistType.OtherIndividual) &&
			at !== ArtistType.Vocalist
		);
	}

	public constructor(
		private readonly values: GlobalValues,
		private artistRepo: ArtistRepository,
		userRepository: UserRepository,
		private urlMapper: UrlMapper,
		webLinkCategories: TranslatedEnumField[],
		data: ArtistForEditContract,
		private dialogService: IDialogService,
	) {
		this.artistTypeStr = ko.observable(data.artistType);
		this.artistType = ko.computed(() => this.artistTypeStr());
		this.allowBaseVoicebank = ko.computed(() =>
			this.canHaveBaseVoicebank(this.artistType()),
		);
		this.associatedArtists = ko.observableArray(
			data.associatedArtists.map((a) => new ArtistForArtistEditViewModel(a)),
		);
		this.baseVoicebank = new BasicEntryLinkViewModel(
			data.baseVoicebank,
			(entryId) =>
				artistRepo.getOne({ id: entryId, lang: values.languagePreference }),
		);
		this.description = new EnglishTranslatedStringEditViewModel(
			data.description,
		);
		this.defaultNameLanguage = ko.observable(data.defaultNameLanguage);
		this.groups = ko.observableArray(data.groups);
		this.id = data.id;
		this.illustrator = new BasicEntryLinkViewModel(
			data.illustrator,
			(entryId) =>
				artistRepo.getOne({ id: entryId, lang: values.languagePreference }),
		);
		this.names = NamesEditViewModel.fromContracts(data.names);
		this.newAssociatedArtist = new BasicEntryLinkViewModel<ArtistContract>(
			null!,
			(entryId) =>
				artistRepo.getOne({ id: entryId, lang: values.languagePreference }),
		);
		this.pictures = new EntryPictureFileListEditViewModel(data.pictures);
		this.releaseDate = ko.observable(
			data.releaseDate ? moment(data.releaseDate).toDate() : null!,
		); // Assume server date is UTC
		this.status = ko.observable(data.status);
		this.voiceProvider = new BasicEntryLinkViewModel(
			data.voiceProvider,
			(entryId) =>
				artistRepo.getOne({ id: entryId, lang: values.languagePreference }),
		);
		this.webLinks = new WebLinksEditViewModel(data.webLinks, webLinkCategories);

		this.baseVoicebankSearchParams = {
			acceptSelection: this.baseVoicebank.id,
			extraQueryParams: {
				artistTypes: [
					ArtistType.Vocaloid,
					ArtistType.UTAU,
					ArtistType.CeVIO,
					ArtistType.SynthesizerV,
					ArtistType.OtherVocalist,
					ArtistType.OtherVoiceSynthesizer,
					ArtistType.Unknown,
				].join(','),
			},
			ignoreId: this.id,
		};

		this.canHaveCircles = ko.computed(() => {
			return this.artistType() !== ArtistType.Label;
		});

		this.canHaveRelatedArtists = ko.computed(() => {
			return ArtistHelper.canHaveChildVoicebanks(this.artistType());
		});

		this.canHaveReleaseDate = ko.computed(() => {
			const vocaloidTypes = [
				ArtistType.Vocaloid,
				ArtistType.UTAU,
				ArtistType.CeVIO,
				ArtistType.OtherVoiceSynthesizer,
				ArtistType.SynthesizerV,
			];
			return vocaloidTypes.includes(this.artistType());
		});

		this.newAssociatedArtist.entry.subscribe(this.addAssociatedArtist);

		this.validationError_needReferences = ko.computed(
			() =>
				(this.description.original() == null ||
					this.description.original().length) === 0 &&
				this.webLinks.items().length === 0,
		);
		this.validationError_needType = ko.computed(
			() => this.artistType() === ArtistType.Unknown,
		);
		this.validationError_unspecifiedNames = ko.computed(
			() => !this.names.hasPrimaryName(),
		);
		this.validationError_unnecessaryPName = ko.computed(() => {
			var allNames = this.names.getAllNames();
			return allNames.some((n) =>
				allNames.some(
					(n2) =>
						n !== n2 &&
						(n.value() === n2.value() + 'P' ||
							n.value() === n2.value() + '-P' ||
							n.value() === n2.value() + 'p' ||
							n.value() === n2.value() + '-p'),
				),
			);
		});

		this.hasValidationErrors = ko.computed(
			() =>
				this.validationError_needReferences() ||
				this.validationError_needType() ||
				this.validationError_unspecifiedNames() ||
				this.validationError_unnecessaryPName(),
		);

		window.setInterval(
			() =>
				userRepository.refreshEntryEdit({
					entryType: EntryType.Artist,
					entryId: data.id,
				}),
			10000,
		);
	}
}

export class ArtistForArtistEditViewModel {
	public constructor(link: ArtistForArtistContract) {
		this.linkType = ko.observable(link.linkType!);
		this.parent = link.parent;
	}

	public linkType: Observable<string>;

	public parent: ArtistContract;

	public toContract = (): ArtistForArtistContract => {
		return {
			linkType: this.linkType(),
			parent: this.parent,
		} as ArtistForArtistContract;
	};
}
