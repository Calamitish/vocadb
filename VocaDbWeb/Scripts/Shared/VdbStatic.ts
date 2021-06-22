import ContentLanguagePreference from '@Models/Globalization/ContentLanguagePreference';

interface VdbFunctionsStatic {
	boldCaseInsensitive: (text: string, term: string) => string;

	disableTabReload: (tab: any) => void;

	showLoginPopup: () => void;
}

interface VdbResourcesStatic {
	albumEdit: any;
	entryEdit: any;
	shared: any;
	song: any;
	album: { addedToCollection?: string };
	albumDetails: {
		download: string;
	};
}

interface VdbValuesStatic {
	/** URL of the site path, for example "/" */
	baseAddress: string;

	/** Whether the user is logged in. */
	isLoggedIn: boolean;

	loggedUserId: number;

	languagePreference: ContentLanguagePreference;

	culture: string;

	/** UI language code, for example "en" */
	uiCulture: string;
}

interface VdbStatic {
	functions: VdbFunctionsStatic;
	resources: VdbResourcesStatic;
	values: VdbValuesStatic;
}

const vdb: VdbStatic = {
	functions: {} as VdbFunctionsStatic,
	resources: {} as VdbResourcesStatic,
	values: {
		baseAddress: '/',
		isLoggedIn: false,
		loggedUserId: 0,
		languagePreference: ContentLanguagePreference.Default,
		culture: '',
		uiCulture: '',
	},
};

export default vdb;

declare global {
	interface Window {
		vdb: VdbStatic;
	}
}

window.vdb = vdb;
