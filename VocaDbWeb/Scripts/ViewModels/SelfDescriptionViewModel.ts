import { ArtistApiContract } from '@/DataContracts/Artist/ArtistApiContract';
import { ArtistContract } from '@/DataContracts/Artist/ArtistContract';
import { ArtistRepository } from '@/Repositories/ArtistRepository';
import { GlobalValues } from '@/Shared/GlobalValues';
import { BasicEntryLinkViewModel } from '@/ViewModels/BasicEntryLinkViewModel';
import ko, { Observable } from 'knockout';

export class SelfDescriptionViewModel {
	public constructor(
		values: GlobalValues,
		author: ArtistApiContract,
		text: string,
		artistRepo: ArtistRepository,
		private getArtists: () => Promise<ArtistContract[]>,
		private saveFunc: (vm: SelfDescriptionViewModel) => void,
	) {
		this.author = new BasicEntryLinkViewModel<ArtistApiContract>(
			author,
			(artistId) =>
				artistRepo.getOneWithComponents({
					id: artistId,
					fields: 'MainPicture',
					lang: values.languagePreference,
				}),
		);
		this.text = ko.observable(text);
	}

	public artists = ko.observableArray<ArtistContract>();

	public author: BasicEntryLinkViewModel<ArtistApiContract>;

	public beginEdit = (): void => {
		this.originalAuthor = this.author.id();
		this.originalText = this.text();

		if (!this.artists().length) {
			this.getArtists().then((artists) => {
				this.artists(artists);
				this.editing(true);
			});
		} else {
			this.editing(true);
		}
	};

	public cancelEdit = (): void => {
		this.text(this.originalText);
		this.author.id(this.originalAuthor);
		this.editing(false);
	};

	public editing = ko.observable(false);

	private originalAuthor!: number;
	private originalText!: string;

	public save = (): void => {
		this.saveFunc(this);
		this.editing(false);
	};

	public text: Observable<string>;
}
