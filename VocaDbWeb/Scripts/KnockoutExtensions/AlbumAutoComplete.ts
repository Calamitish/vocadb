import { AlbumContract } from '@/DataContracts/Album/AlbumContract';
import { AlbumAutoCompleteParams } from '@/KnockoutExtensions/AutoCompleteParams';
import { initEntrySearch } from '@/Shared/EntryAutoComplete';
import { functions } from '@/Shared/GlobalFunctions';
import ko from 'knockout';

declare global {
	interface KnockoutBindingHandlers {
		// Album autocomplete search box.
		albumAutoComplete: KnockoutBindingHandler;
	}
}

export function albumAutoComplete(
	element: HTMLElement,
	valueAccessor: () => any,
): void {
	var properties: AlbumAutoCompleteParams = ko.utils.unwrapObservable(
		valueAccessor(),
	);

	var filter = properties.filter;

	if (properties.ignoreId) {
		filter = (item): boolean => {
			if (item.id === properties.ignoreId) {
				return false;
			}

			return properties.filter != null ? properties.filter(item) : true;
		};
	}

	var queryParams = {
		nameMatchMode: 'Auto',
		lang: vdb.values.languagePreference,
		preferAccurateMatches: true,
		maxResults: 15,
	};
	if (properties.extraQueryParams)
		jQuery.extend(queryParams, properties.extraQueryParams);

	initEntrySearch(element, functions.mapAbsoluteUrl('/api/albums'), {
		acceptSelection: properties.acceptSelection!,
		createNewItem: properties.createNewItem,
		createCustomItem: properties.createCustomItem,
		createOptionFirstRow: (item: AlbumContract) =>
			item.name + ' (' + item.discType + ')',
		createOptionSecondRow: (item: AlbumContract) => item.artistString,
		extraQueryParams: queryParams,
		filter: filter,
		termParamName: 'query',
	});
}

ko.bindingHandlers.albumAutoComplete = {
	init: albumAutoComplete,
};
