import UserWithPermissionsContract from '@DataContracts/User/UserWithPermissionsContract';
import ContentLanguagePreference from '@Models/Globalization/ContentLanguagePreference';

interface MenuPageLink {
	bannerImg: string;
	title: string;
	url: string;
}

// Corresponds to the GlobalValues record class in C#.
export default interface GlobalValues {
	albumTypes: string /* TODO: enum AlbumType */[];
	artistTypes: string /* TODO: enum ArtistType */[];
	externalHelpPath?: string;
	gaAccountId: string;
	hostAddress: string;
	lockdownMessage?: string;
	songTypes: string /* TODO: enum SongType */[];
	staticContentHost: string;

	siteName: string;
	siteTitle: string;

	bannerUrl?: string;
	blogUrl?: string;
	patreonLink?: string;
	sitewideAnnouncement?: string;

	amazonComAffiliateId: string;
	amazonJpAffiliateId: string;
	playAsiaAffiliateId: string;
	freeTagId: number;
	instrumentalTagId: number;

	/** URL of the site path, for example "/" */
	baseAddress: string;
	languagePreference: ContentLanguagePreference;
	/** Whether the user is logged in. */
	isLoggedIn: boolean;
	loggedUserId: number;
	loggedUser?: UserWithPermissionsContract;
	culture: string;
	/** UI language code, for example "en" */
	uiCulture: string;

	slogan: string;

	appLinks: MenuPageLink[];
	bigBanners: MenuPageLink[];
	smallBanners: MenuPageLink[];
	socialLinks: MenuPageLink[];
}
