import $ from 'jquery';

export const EventEventsBySeries = (): void => {
	$(function () {
		$('#createEventLink').button({ icons: { primary: 'ui-icon-plus' } });
		$('#createSeriesLink').button({ icons: { primary: 'ui-icon-plus' } });
		$('#createVenueLink').button({ icons: { primary: 'ui-icon-plus' } });
	});
};
