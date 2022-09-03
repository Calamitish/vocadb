import { AlbumReviewContract } from '@/DataContracts/Album/AlbumReviewContract';
import { ArtistApiContract } from '@/DataContracts/Artist/ArtistApiContract';
import { CommentContract } from '@/DataContracts/CommentContract';
import { TagSelectionContract } from '@/DataContracts/Tag/TagSelectionContract';
import { TagUsageForApiContract } from '@/DataContracts/Tag/TagUsageForApiContract';
import { AlbumForUserForApiContract } from '@/DataContracts/User/AlbumForUserForApiContract';
import { UserApiContract } from '@/DataContracts/User/UserApiContract';
import { ArtistHelper } from '@/Helpers/ArtistHelper';
import { EntryType } from '@/Models/EntryType';
import {
	AlbumOptionalField,
	AlbumRepository,
} from '@/Repositories/AlbumRepository';
import { ArtistRepository } from '@/Repositories/ArtistRepository';
import { UserRepository } from '@/Repositories/UserRepository';
import { functions } from '@/Shared/GlobalFunctions';
import { GlobalValues } from '@/Shared/GlobalValues';
import { ui } from '@/Shared/MessagesTyped';
import { EditableCommentsViewModel } from '@/ViewModels/EditableCommentsViewModel';
import { EnglishTranslatedStringViewModel } from '@/ViewModels/Globalization/EnglishTranslatedStringViewModel';
import {
	IEntryReportType,
	ReportEntryViewModel,
} from '@/ViewModels/ReportEntryViewModel';
import { SelfDescriptionViewModel } from '@/ViewModels/SelfDescriptionViewModel';
import { TagListViewModel } from '@/ViewModels/Tag/TagListViewModel';
import { TagsEditViewModel } from '@/ViewModels/Tag/TagsEditViewModel';
import $ from 'jquery';
import ko, { Observable } from 'knockout';
import _ from 'lodash';

export class AlbumDetailsViewModel {
	public comments: EditableCommentsViewModel;

	public downloadTagsDialog: DownloadTagsViewModel;

	private id: number;

	public reportViewModel: ReportEntryViewModel;

	public description: EnglishTranslatedStringViewModel;

	public personalDescription: SelfDescriptionViewModel;

	public reviewsViewModel: AlbumReviewsViewModel;

	public tagsEditViewModel: TagsEditViewModel;

	public tagUsages: TagListViewModel;

	public usersContent = ko.observable<string>();

	public getUsers = (): boolean => {
		$.post(
			functions.mapAbsoluteUrl('/Album/UsersWithAlbumInCollection'),
			{ albumId: this.id },
			(result) => {
				this.usersContent(result);
				$('#userCollectionsPopup').dialog('open');
			},
		);

		return false;
	};

	public constructor(
		values: GlobalValues,
		repo: AlbumRepository,
		userRepo: UserRepository,
		artistRepository: ArtistRepository,
		data: AlbumDetailsAjax,
		reportTypes: IEntryReportType[],
		canDeleteAllComments: boolean,
		formatString: string,
		showTranslatedDescription: boolean,
	) {
		this.id = data.id;
		this.downloadTagsDialog = new DownloadTagsViewModel(this.id, formatString);
		this.description = new EnglishTranslatedStringViewModel(
			showTranslatedDescription,
		);
		this.comments = new EditableCommentsViewModel(
			values,
			repo,
			this.id,
			canDeleteAllComments,
			canDeleteAllComments,
			false,
			data.latestComments,
			true,
		);

		this.personalDescription = new SelfDescriptionViewModel(
			values,
			data.personalDescriptionAuthor!,
			data.personalDescriptionText!,
			artistRepository,
			() =>
				repo
					.getOneWithComponents({
						id: this.id,
						fields: [AlbumOptionalField.Artists],
						lang: values.languagePreference,
					})
					.then((result) => {
						var artists = _.chain(result.artists!)
							.filter(ArtistHelper.isValidForPersonalDescription)
							.map((a) => a.artist)
							.value();
						return artists;
					}),
			(vm) =>
				repo.updatePersonalDescription({
					albumId: this.id,
					text: vm.text(),
					author: vm.author.entry(),
				}),
		);

		this.tagsEditViewModel = new TagsEditViewModel(
			{
				getTagSelections: (): Promise<TagSelectionContract[]> =>
					userRepo.getAlbumTagSelections({ albumId: this.id }),
				saveTagSelections: (tags): Promise<void> =>
					userRepo
						.updateAlbumTags({ albumId: this.id, tags: tags })
						.then(this.tagUsages.updateTagUsages),
			},
			EntryType.Album,
			() => repo.getTagSuggestions({ albumId: this.id }),
		);

		this.tagUsages = new TagListViewModel(data.tagUsages);

		this.reportViewModel = new ReportEntryViewModel(
			reportTypes,
			(reportType, notes) => {
				repo.createReport({
					albumId: this.id,
					reportType: reportType,
					notes: notes,
					versionNumber: undefined,
				});

				ui.showSuccessMessage(vdb.resources.shared.reportSent);
			},
		);

		this.reviewsViewModel = new AlbumReviewsViewModel(
			repo,
			this.id,
			canDeleteAllComments,
			canDeleteAllComments,
		);
	}
}

export interface AlbumDetailsAjax {
	id: number;
	latestComments: CommentContract[];
	personalDescriptionText?: string;
	personalDescriptionAuthor?: ArtistApiContract;
	tagUsages: TagUsageForApiContract[];
}

export class DownloadTagsViewModel {
	public dialogVisible = ko.observable(false);

	public downloadTags = (): void => {
		this.dialogVisible(false);

		var url = '/Album/DownloadTags/' + this.albumId;
		window.location.href =
			url +
			'?setFormatString=true&formatString=' +
			encodeURIComponent(this.formatString());
	};

	public formatString: Observable<string>;

	public dialogButtons = ko.observableArray([
		{ text: vdb.resources.albumDetails.download, click: this.downloadTags },
	]);

	public show = (): void => {
		this.dialogVisible(true);
	};

	public constructor(private albumId: number, formatString: string) {
		this.formatString = ko.observable(formatString);
	}
}

export class AlbumReviewsViewModel {
	public constructor(
		private readonly albumRepository: AlbumRepository,
		private readonly albumId: number,
		private readonly canDeleteAllComments: boolean,
		private readonly canEditAllComments: boolean,
		private readonly loggedUserId?: number,
	) {}

	public beginEditReview = (review: AlbumReviewViewModel): void => {
		review.beginEdit();
		this.editReviewModel(review);
	};

	public cancelEditReview = (): void => {
		this.editReviewModel(null!);
	};

	private canDeleteReview = (comment: AlbumReviewContract): boolean => {
		// If one can edit they can also delete
		return (
			this.canDeleteAllComments ||
			this.canEditAllComments ||
			(comment.user && comment.user.id === this.loggedUserId)
		);
	};

	private canEditReview = (comment: AlbumReviewContract): boolean => {
		return (
			this.canEditAllComments ||
			(comment.user && comment.user.id === this.loggedUserId)
		);
	};

	public async createNewReview(): Promise<void> {
		const contract = {
			date: new Date().toLocaleDateString(),
			languageCode: this.languageCode(),
			text: this.newReviewText(),
			title: this.newReviewTitle(),
			user: { id: this.loggedUserId! },
		};
		this.newReviewText('');
		this.newReviewTitle('');
		this.showCreateNewReview(false);
		this.languageCode('');
		const result = await this.albumRepository.createOrUpdateReview({
			albumId: this.albumId,
			reviewContract: contract,
		});
		this.reviews.push(
			new AlbumReviewViewModel(
				result,
				this.canDeleteReview(result),
				this.canEditReview(result),
			),
		);
	}

	public deleteReview = (review: AlbumReviewViewModel): void => {
		this.reviews.remove(review);

		this.albumRepository.deleteReview({
			albumId: this.albumId,
			reviewId: review.id!,
		});
	};

	public getRatingForUser(userId: number): number {
		return _.chain(this.userRatings())
			.filter(
				(rating) =>
					!!rating.user && rating.user.id === userId && !!rating.rating,
			)
			.map((rating) => rating.rating)
			.take(1)
			.value()[0];
	}

	public ratingStars(userRating: number): { enabled: boolean }[] {
		var ratings = [1, 2, 3, 4, 5].map((rating) => ({
			enabled: Math.round(userRating) >= rating,
		}));
		return ratings;
	}

	public saveEditedReview = (): void => {
		if (!this.editReviewModel()) return;

		this.editReviewModel()!.saveChanges();
		var editedContract = this.editReviewModel()!.toContract();

		this.albumRepository.createOrUpdateReview({
			albumId: this.albumId,
			reviewContract: editedContract,
		});

		this.editReviewModel(null!);
	};

	public async loadReviews(): Promise<void> {
		const [reviews, ratings] = await Promise.all([
			this.albumRepository.getReviews({ albumId: this.albumId }),
			this.albumRepository.getUserCollections({ albumId: this.albumId }),
		]);
		const reviewViewModels = reviews.map(
			(review) =>
				new AlbumReviewViewModel(
					review,
					this.canDeleteReview(review),
					this.canEditReview(review),
				),
		);
		this.reviews(reviewViewModels);
		this.userRatings(ratings);
	}

	public editReviewModel = ko.observable<AlbumReviewViewModel>(null!);

	public languageCode = ko.observable('');

	public newReviewText = ko.observable('');

	public newReviewTitle = ko.observable('');

	public reviews = ko.observableArray<AlbumReviewViewModel>();

	public showCreateNewReview = ko.observable(false);

	public writeReview = ko.observable(false);

	public reviewAlreadySubmitted = ko.computed(() => {
		return this.reviews().some(
			(review) =>
				review.user.id === this.loggedUserId &&
				review.languageCode() === this.languageCode(),
		);
	});

	private userRatings = ko.observableArray<AlbumForUserForApiContract>();
}

export class AlbumReviewViewModel {
	public constructor(
		contract: AlbumReviewContract,
		public canBeDeleted: boolean,
		public canBeEdited: boolean,
	) {
		this.date = new Date(contract.date);
		this.id = contract.id;
		this.languageCode = ko.observable(contract.languageCode);
		this.text = ko.observable(contract.text);
		this.title = ko.observable(contract.title);
		this.user = contract.user;
	}

	public beginEdit = (): void => {
		this.editedTitle(this.title());
		this.editedText(this.text());
	};

	public saveChanges = (): void => {
		this.text(this.editedText());
		this.title(this.editedTitle());
	};

	public toContract: () => AlbumReviewContract = () => {
		return {
			date: this.date.toISOString(),
			id: this.id,
			languageCode: this.languageCode(),
			text: this.text(),
			title: this.title(),
			user: this.user,
		};
	};

	public date: Date;

	public editedTitle = ko.observable('');

	public editedText = ko.observable('');

	public id?: number;

	public languageCode: Observable<string>;

	public text: Observable<string>;

	public title: Observable<string>;

	public user: UserApiContract;
}
