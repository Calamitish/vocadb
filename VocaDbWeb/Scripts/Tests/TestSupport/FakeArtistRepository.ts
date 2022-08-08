import ArtistContract from '@/DataContracts/Artist/ArtistContract';
import ContentLanguagePreference from '@/Models/Globalization/ContentLanguagePreference';
import ArtistRepository from '@/Repositories/ArtistRepository';
import HttpClient from '@/Shared/HttpClient';
import FakePromise from '@/Tests/TestSupport/FakePromise';

export default class FakeArtistRepository extends ArtistRepository {
	public result: ArtistContract = null!;

	public constructor() {
		super(new HttpClient(), '');

		this.getOne = ({
			id,
			lang,
		}: {
			id: number;
			lang: ContentLanguagePreference;
		}): Promise<ArtistContract> => {
			return FakePromise.resolve(this.result);
		};
	}
}
