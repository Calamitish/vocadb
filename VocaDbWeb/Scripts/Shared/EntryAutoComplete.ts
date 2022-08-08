import EntryWithTagUsagesContract from '@/DataContracts/Base/EntryWithTagUsagesContract';
import PartialFindResultContract from '@/DataContracts/PartialFindResultContract';
import HtmlHelper from '@/Helpers/HtmlHelper';
import $ from 'jquery';

export interface EntryAutoCompleteParams<TContract> {
	acceptSelection: (
		entryId?: number,
		name?: string,
		entryType?: string,
		data?: TContract,
	) => void;

	createCustomItem?: string;

	// Label template for creating a new item.
	// {0} will be replaced with the searched item, for example "Create new song named {0}".
	// If empty or undefined, no new entries can be created this way.
	createNewItem?: string;

	// Creates the content for the first row of the autocomplete item.
	// HTML is escaped.
	createOptionFirstRow: (entry: TContract) => string;

	// Creates the content for the second row of the autocomplete item (optional).
	// HTML is escaped.
	createOptionSecondRow?: (entry: TContract) => string;

	extraQueryParams: any;

	filter?: (entry: TContract) => boolean;

	// Callback for manipulating the query params based on the actual query
	// queryParams: search query params (parameters to the query)
	// term: query term
	onQuery?: (queryParams: any, term: string) => void;

	singleRow?: boolean;

	termParamName?: string;
}

export interface AutoCompleteItem<TContract> {
	data?: TContract;

	label: string;

	itemType?: string;

	term: string;

	value?: number;
}

export function initEntrySearch<TContract extends EntryWithTagUsagesContract>(
	nameBoxElem: HTMLElement,
	searchUrl: string,
	params: EntryAutoCompleteParams<TContract>,
): void {
	if (!params) throw Error('params cannot be null');

	var createNewItem = params.createNewItem;
	var createCustomItem = params.createCustomItem;
	var acceptSelection = params.acceptSelection;
	var extraQueryParams = params.extraQueryParams;
	var createOptionFirstRow = params.createOptionFirstRow;
	var createOptionSecondRow = params.createOptionSecondRow;
	var filter = params.filter;
	var termParamName = params.termParamName || 'query';
	var method = 'GET';

	function bold(text: string, term: string): string {
		return HtmlHelper.boldAndHtmlEncode(text, term);
	}

	function createHtml(item: AutoCompleteItem<TContract>): string {
		var data = item.data;

		if (!data) {
			return '<a><div>' + item.label + '</div></a>';
		}

		var html: string = null!;
		var term = item.term;
		var firstRow: string;

		if (createOptionFirstRow && createOptionSecondRow) {
			firstRow = createOptionFirstRow(data);
			var secondRow = createOptionSecondRow(data);
			if (firstRow) {
				if (params.singleRow) {
					html =
						'<a><div>' +
						bold(firstRow, term) +
						" <small class='extraInfo'>" +
						HtmlHelper.htmlEncode(secondRow) +
						'</small></div></a>';
				} else {
					html =
						'<a><div>' +
						bold(firstRow, term) +
						"</div><div><small class='extraInfo'>" +
						HtmlHelper.htmlEncode(secondRow) +
						'</small></div></a>';
				}
			}
		} else if (createOptionFirstRow) {
			firstRow = createOptionFirstRow(data);
			if (firstRow) html = '<a><div>' + bold(firstRow, term) + '</div></a>';
		}

		return html;
	}

	function getItems(
		par: { term: string },
		response: (result: AutoCompleteItem<TContract>[]) => void,
	): void {
		var queryParams: any = {};
		queryParams[termParamName] = par.term;

		if (params.onQuery) params.onQuery(queryParams, par.term);

		if (extraQueryParams != null) jQuery.extend(queryParams, extraQueryParams);

		$.ajax({
			type: method,
			url: searchUrl,
			data: queryParams,
			success: (result: PartialFindResultContract<TContract>) => {
				var filtered = !filter ? result.items : result.items.filter(filter);

				var mapped: AutoCompleteItem<TContract>[] = filtered.map((item) => ({
					label: item.name,
					value: item.id,
					data: item,
					term: par.term,
				}));

				if (createNewItem)
					mapped.push({
						label: createNewItem.replace('{0}', par.term),
						value: null!,
						term: par.term,
						itemType: 'new',
					});

				if (createCustomItem)
					mapped.push({
						label: createCustomItem.replace('{0}', par.term),
						value: null!,
						term: par.term,
						itemType: 'custom',
					});

				response(mapped);
			},
		});
	}

	function selectItem(
		event: Event,
		ui: { item?: AutoCompleteItem<TContract> },
	): boolean {
		var item: AutoCompleteItem<TContract> = ui.item!;

		// namebox value is cleared when using keyboard
		acceptSelection(
			item.value,
			$(nameBoxElem).val() || item.term,
			item.itemType,
			item.data,
		);
		$(nameBoxElem).val('');

		return false;
	}

	var auto = $(nameBoxElem)
		.autocomplete({
			source: getItems,
			select: selectItem,
		})
		.data('ui-autocomplete');

	if (auto) {
		auto._renderItem = (
			ul: HTMLElement,
			item: AutoCompleteItem<TContract>,
		): JQuery => {
			return $('<li>')
				.data('item.ui-autocomplete', item)
				.append(createHtml(item))
				.appendTo(ul);
		};
	}
}
